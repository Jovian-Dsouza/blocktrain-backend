import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../lib/prisma';
import { CreateTelegramUserRequest, CreateWalletSubscriptionRequest, TelegramNotification } from '../types/telegram';
import { TradeType } from '../types/trade';

export class TelegramBotService {
  private bot: TelegramBot;
  private isPolling: boolean = false;

  constructor(token: string) {
    this.bot = new TelegramBot(token, { polling: false });
  }

  async startPolling(): Promise<void> {
    if (this.isPolling) return;
    
    this.bot.startPolling();
    this.isPolling = true;
    this.setupCommandHandlers();
    console.log('Telegram bot started polling...');
  }

  async stopPolling(): Promise<void> {
    if (!this.isPolling) return;
    
    this.bot.stopPolling();
    this.isPolling = false;
    console.log('Telegram bot stopped polling...');
  }

  private setupCommandHandlers(): void {
    // Start command
    this.bot.onText(/\/start/, async (msg) => {
      const chatId = msg.chat.id;
      const username = msg.from?.username;
      const firstName = msg.from?.first_name;
      const lastName = msg.from?.last_name;

      try {
        // Register or update user
        await this.registerUser({
          chatId: chatId.toString(),
          username,
          firstName,
          lastName
        });

        const welcomeMessage = `
🚀 *Welcome to BlockTrain Wallet Tracker!*

I'll help you track trading events for your wallet addresses.

*Available Commands:*
/add <wallet_address> - Add a wallet to track
/remove <wallet_address> - Remove a wallet from tracking
/list - List all your tracked wallets
/help - Show this help message

*Example:*
\`/add 0x1234567890abcdef1234567890abcdef12345678\`

Let's start tracking! 📈
        `;

        await this.bot.sendMessage(chatId, welcomeMessage, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Error handling /start command:', error);
        await this.bot.sendMessage(chatId, 'Sorry, there was an error. Please try again.');
      }
    });

    // Add wallet command
    this.bot.onText(/\/add (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const walletAddress = match?.[1];

      if (!walletAddress) {
        await this.bot.sendMessage(chatId, 'Please provide a wallet address.\nExample: /add 0x1234567890abcdef1234567890abcdef12345678');
        return;
      }

      try {
        await this.addWalletSubscription({
          chatId: chatId.toString(),
          walletAddress: walletAddress.trim()
        });

        await this.bot.sendMessage(chatId, `✅ Wallet \`${walletAddress}\` added to tracking!`, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Error adding wallet:', error);
        await this.bot.sendMessage(chatId, 'Sorry, there was an error adding the wallet. Please try again.');
      }
    });

    // Remove wallet command
    this.bot.onText(/\/remove (.+)/, async (msg, match) => {
      const chatId = msg.chat.id;
      const walletAddress = match?.[1];

      if (!walletAddress) {
        await this.bot.sendMessage(chatId, 'Please provide a wallet address to remove.');
        return;
      }

      try {
        await this.removeWalletSubscription({
          chatId: chatId.toString(),
          walletAddress: walletAddress.trim()
        });

        await this.bot.sendMessage(chatId, `✅ Wallet \`${walletAddress}\` removed from tracking.`, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Error removing wallet:', error);
        await this.bot.sendMessage(chatId, 'Sorry, there was an error removing the wallet. Please try again.');
      }
    });

    // List wallets command
    this.bot.onText(/\/list/, async (msg) => {
      const chatId = msg.chat.id;

      try {
        const wallets = await this.getUserWallets(chatId.toString());
        
        if (wallets.length === 0) {
          await this.bot.sendMessage(chatId, 'You have no wallets being tracked.\nUse /add <wallet_address> to add one.');
          return;
        }

        let message = '📋 *Your Tracked Wallets:*\n\n';
        wallets.forEach((wallet, index) => {
          message += `${index + 1}. \`${wallet.walletAddress}\`\n`;
        });

        await this.bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });
      } catch (error) {
        console.error('Error listing wallets:', error);
        await this.bot.sendMessage(chatId, 'Sorry, there was an error fetching your wallets.');
      }
    });

    // Help command
    this.bot.onText(/\/help/, async (msg) => {
      const chatId = msg.chat.id;
      const helpMessage = `
🤖 *BlockTrain Wallet Tracker Help*

*Commands:*
/start - Start the bot and register
/add <wallet_address> - Add a wallet to track
/remove <wallet_address> - Remove a wallet from tracking
/list - List all your tracked wallets
/help - Show this help message

*How it works:*
1. Add wallet addresses using /add command
2. I'll monitor these wallets for trading events
3. You'll receive notifications when trades happen
4. Track BUY/SELL events with amounts and prices

*Example:*
\`/add 0x1234567890abcdef1234567890abcdef12345678\`

Need help? Just ask! 🚀
      `;

      await this.bot.sendMessage(chatId, helpMessage, { parse_mode: 'Markdown' });
    });

    // Handle unknown commands
    this.bot.on('message', async (msg) => {
      if (msg.text && !msg.text.startsWith('/')) {
        const chatId = msg.chat.id;
        await this.bot.sendMessage(chatId, 'Unknown command. Use /help to see available commands.');
      }
    });
  }

  async registerUser(userData: CreateTelegramUserRequest): Promise<void> {
    await prisma.telegramUser.upsert({
      where: { chatId: userData.chatId },
      update: {
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isActive: true
      },
      create: {
        chatId: userData.chatId,
        username: userData.username,
        firstName: userData.firstName,
        lastName: userData.lastName,
        isActive: true
      }
    });
  }

  async addWalletSubscription(subscriptionData: CreateWalletSubscriptionRequest): Promise<void> {
    // First ensure user exists
    await this.registerUser({
      chatId: subscriptionData.chatId,
      username: undefined,
      firstName: undefined,
      lastName: undefined
    });

    // Get user ID
    const user = await prisma.telegramUser.findUnique({
      where: { chatId: subscriptionData.chatId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Add wallet subscription
    await prisma.walletSubscription.upsert({
      where: {
        telegramUserId_walletAddress: {
          telegramUserId: user.id,
          walletAddress: subscriptionData.walletAddress
        }
      },
      update: {
        isActive: true
      },
      create: {
        telegramUserId: user.id,
        walletAddress: subscriptionData.walletAddress,
        isActive: true
      }
    });
  }

  async removeWalletSubscription(subscriptionData: CreateWalletSubscriptionRequest): Promise<void> {
    const user = await prisma.telegramUser.findUnique({
      where: { chatId: subscriptionData.chatId }
    });

    if (!user) {
      throw new Error('User not found');
    }

    await prisma.walletSubscription.updateMany({
      where: {
        telegramUserId: user.id,
        walletAddress: subscriptionData.walletAddress
      },
      data: {
        isActive: false
      }
    });
  }

  async getUserWallets(chatId: string): Promise<{ walletAddress: string }[]> {
    const user = await prisma.telegramUser.findUnique({
      where: { chatId },
      include: {
        walletSubscriptions: {
          where: { isActive: true },
          select: { walletAddress: true }
        }
      }
    });

    return user?.walletSubscriptions || [];
  }

  async sendNotification(notification: TelegramNotification): Promise<void> {
    try {
      await this.bot.sendMessage(notification.chatId, notification.message, { 
        parse_mode: 'Markdown',
        disable_web_page_preview: true
      });
    } catch (error) {
      console.error('Error sending Telegram notification:', error);
    }
  }

  async sendTradeNotification(event: any): Promise<void> {
    // Get all active subscriptions for this wallet
    const subscriptions = await prisma.walletSubscription.findMany({
      where: {
        walletAddress: event.walletAddress,
        isActive: true
      },
      include: {
        telegramUser: true
      }
    });

    // Send notification to each subscriber
    for (const subscription of subscriptions) {
      if (!subscription.telegramUser.isActive) continue;

      const tradeTypeEmoji = event.tradeType === 'BUY' ? '🟢' : '🔴';
      const tradeTypeText = event.tradeType === 'BUY' ? 'BUY' : 'SELL';
      
      const message = `
${tradeTypeEmoji} *New ${tradeTypeText} Event*

📍 *Wallet:* \`${event.walletAddress}\`
🪙 *Token:* \`${event.token1}\`
💰 *Amount:* ${event.amount1?.toFixed(6) || 'N/A'}
${event.priceAt ? `💵 *Price:* $${event.priceAt.toFixed(2)}` : ''}
⏰ *Time:* ${new Date(event.tradedAt).toLocaleString()}

*Event ID:* \`${event.id}\`
      `;

      await this.sendNotification({
        chatId: subscription.telegramUser.chatId,
        message,
        walletAddress: event.walletAddress,
        eventId: event.id
      });
    }
  }

  async getBot(): Promise<TelegramBot> {
    return this.bot;
  }
}
