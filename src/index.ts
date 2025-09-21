import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { tradeRoutes } from './routes/tradeRoutes';
import { errorHandler } from './middleware/errorHandler';
import { TelegramBotService } from './services/telegramBot';
import { NotificationService } from './services/notificationService';
import { setNotificationService } from './controllers/tradeController';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/v1', tradeRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Error handling middleware
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Initialize Telegram Bot and Notification Service
const initializeServices = async () => {
  const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
  
  if (!telegramToken) {
    console.warn('TELEGRAM_BOT_TOKEN not found. Telegram bot will not be available.');
    return;
  }

  try {
    // Initialize Telegram Bot
    const telegramBot = new TelegramBotService(telegramToken);
    await telegramBot.startPolling();

    // Initialize Notification Service
    const notificationService = new NotificationService(telegramBot);
    setNotificationService(notificationService);

    // Start periodic check for unnotified events
    await notificationService.startPeriodicCheck(30000); // Check every 30 seconds

    console.log('✅ Telegram bot and notification service initialized');
  } catch (error) {
    console.error('❌ Error initializing services:', error);
  }
};

// Start server
app.listen(PORT, async () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  
  // Initialize services after server starts
  await initializeServices();
});
