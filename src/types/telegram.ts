export interface TelegramUser {
  id: string;
  chatId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WalletSubscription {
  id: string;
  telegramUserId: string;
  walletAddress: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateTelegramUserRequest {
  chatId: string;
  username?: string;
  firstName?: string;
  lastName?: string;
}

export interface CreateWalletSubscriptionRequest {
  chatId: string;
  walletAddress: string;
}

export interface TelegramNotification {
  chatId: string;
  message: string;
  walletAddress: string;
  eventId: string;
}
