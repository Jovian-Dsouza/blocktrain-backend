# Telegram Bot Integration

This document explains how to set up and use the Telegram bot integration for wallet tracking.

## Features

- **Wallet Tracking**: Users can add/remove wallet addresses to track
- **Real-time Notifications**: Get instant notifications when trading events occur
- **User Management**: Automatic user registration and subscription management
- **Command Interface**: Easy-to-use commands for managing tracked wallets

## Setup

### 1. Create a Telegram Bot

1. Open Telegram and search for `@BotFather`
2. Send `/newbot` command
3. Follow the prompts to create your bot
4. Save the bot token you receive

### 2. Environment Configuration

Add your bot token to your `.env` file:

```bash
TELEGRAM_BOT_TOKEN="your_telegram_bot_token_here"
```

### 3. Database Migration

Run the database migration to add the new tables:

```bash
npm run db:migrate
```

### 4. Start the Server

```bash
npm run dev
```

The bot will automatically start polling for messages when the server starts.

## Bot Commands

### `/start`
- Registers the user with the bot
- Shows welcome message and available commands

### `/add <wallet_address>`
- Adds a wallet address to tracking
- Example: `/add 0x1234567890abcdef1234567890abcdef12345678`

### `/remove <wallet_address>`
- Removes a wallet address from tracking
- Example: `/remove 0x1234567890abcdef1234567890abcdef12345678`

### `/list`
- Shows all currently tracked wallet addresses

### `/help`
- Displays help information and available commands

## How It Works

### 1. User Registration
When a user sends `/start`, they are automatically registered in the database with their Telegram chat ID and user information.

### 2. Wallet Subscription
Users can add wallet addresses using `/add` command. Each subscription is stored in the database and linked to the user.

### 3. Event Monitoring
When new trading events are created via the API (`POST /api/v1/trade`), the system:
- Checks if the wallet address has active subscribers
- Sends notifications to all subscribers
- Marks the event as notified

### 4. Notification Format
Notifications include:
- Trade type (BUY/SELL) with emoji indicators
- Wallet address
- Token address
- Amount traded
- Price (if available)
- Timestamp
- Event ID

## Database Schema

### New Tables

#### `telegram_users`
- Stores Telegram user information
- Links to wallet subscriptions

#### `wallet_subscriptions`
- Links users to wallet addresses they want to track
- Supports multiple users tracking the same wallet

#### Updated `events` table
- Added `notified` boolean field to track notification status

## API Integration

The bot integrates seamlessly with the existing API:

- **Event Creation**: When new events are created via `POST /api/v1/trade`, notifications are automatically triggered
- **Real-time Processing**: Notifications are sent asynchronously to avoid blocking API responses
- **Periodic Cleanup**: A background process checks for unnotified events every 30 seconds

## Error Handling

- Bot gracefully handles missing tokens (continues without Telegram features)
- Database errors are logged and don't crash the service
- Notification failures are logged but don't affect event creation
- User-friendly error messages for invalid commands

## Security Considerations

- Bot tokens should be kept secure and not committed to version control
- User data is stored securely in the database
- Commands are validated before processing
- Rate limiting is handled by the Telegram API

## Monitoring

- Check server logs for bot initialization status
- Monitor notification delivery success/failure
- Track user registration and subscription metrics
- Monitor database performance with new tables

## Troubleshooting

### Bot Not Responding
1. Check if `TELEGRAM_BOT_TOKEN` is set correctly
2. Verify the token is valid by testing with BotFather
3. Check server logs for initialization errors

### Notifications Not Sending
1. Verify users have active subscriptions
2. Check if events are being marked as notified
3. Review notification service logs

### Database Issues
1. Ensure migrations have been run
2. Check database connection
3. Verify table permissions

## Development

To test the bot locally:

1. Set up your `.env` file with a valid bot token
2. Run the database migrations
3. Start the development server: `npm run dev`
4. Find your bot on Telegram and send `/start`
5. Test the commands to add/remove wallets
6. Create test events via the API to trigger notifications
