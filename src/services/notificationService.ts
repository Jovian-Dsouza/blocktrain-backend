import { prisma } from '../lib/prisma';
import { TelegramBotService } from './telegramBot';

export class NotificationService {
  private telegramBot: TelegramBotService;

  constructor(telegramBot: TelegramBotService) {
    this.telegramBot = telegramBot;
  }

  async processNewEvent(eventId: string): Promise<void> {
    try {
      // Get the event with all details
      const event = await prisma.event.findUnique({
        where: { id: eventId }
      });

      if (!event) {
        console.error(`Event ${eventId} not found`);
        return;
      }

      // Check if already notified
      if (event.notified) {
        console.log(`Event ${eventId} already notified`);
        return;
      }

      // Send Telegram notification
      await this.telegramBot.sendTradeNotification(event);

      // Mark as notified
      await prisma.event.update({
        where: { id: eventId },
        data: { notified: true }
      });

      console.log(`Notification sent for event ${eventId}`);
    } catch (error) {
      console.error(`Error processing notification for event ${eventId}:`, error);
    }
  }

  async processUnnotifiedEvents(): Promise<void> {
    try {
      // Get all unnotified events
      const unnotifiedEvents = await prisma.event.findMany({
        where: { notified: false },
        orderBy: { tradedAt: 'asc' }
      });

      console.log(`Found ${unnotifiedEvents.length} unnotified events`);

      // Process each event
      for (const event of unnotifiedEvents) {
        await this.processNewEvent(event.id);
        // Small delay to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    } catch (error) {
      console.error('Error processing unnotified events:', error);
    }
  }

  async startPeriodicCheck(intervalMs: number = 30000): Promise<void> {
    console.log(`Starting periodic notification check every ${intervalMs}ms`);
    
    setInterval(async () => {
      await this.processUnnotifiedEvents();
    }, intervalMs);
  }
}
