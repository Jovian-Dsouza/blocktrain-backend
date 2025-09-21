#!/bin/bash

# Test script for Telegram bot integration
# Make sure to set your TELEGRAM_BOT_TOKEN in .env file

echo "🚀 Testing Telegram Bot Integration"
echo "=================================="

# Check if server is running
echo "📡 Checking if server is running..."
if curl -s http://localhost:3000/health > /dev/null; then
    echo "✅ Server is running"
else
    echo "❌ Server is not running. Please start it with: npm run dev"
    exit 1
fi

# Test creating a trade event (this should trigger notifications)
echo ""
echo "📊 Creating test trade event..."
curl -X POST http://localhost:3000/api/v1/trade \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "tokenAddress": "0xabcdef1234567890abcdef1234567890abcdef12",
    "tradeType": "BUY",
    "amount": 100.5,
    "priceAt": 25.30
  }' | jq '.'

echo ""
echo "📊 Creating another test trade event..."
curl -X POST http://localhost:3000/api/v1/trade \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890abcdef1234567890abcdef12345678",
    "tokenAddress": "0xabcdef1234567890abcdef1234567890abcdef12",
    "tradeType": "SELL",
    "amount": 50.25,
    "priceAt": 26.15
  }' | jq '.'

echo ""
echo "📋 Getting recent trades for the wallet..."
curl -s "http://localhost:3000/api/v1/recent-trades?walletAddress=0x1234567890abcdef1234567890abcdef12345678&limit=5" | jq '.'

echo ""
echo "✅ Test completed!"
echo ""
echo "📱 To test the Telegram bot:"
echo "1. Find your bot on Telegram"
echo "2. Send /start to register"
echo "3. Send /add 0x1234567890abcdef1234567890abcdef12345678 to track the wallet"
echo "4. The events created above should trigger notifications"
echo ""
echo "🔧 Available bot commands:"
echo "- /start - Register with the bot"
echo "- /add <wallet_address> - Add wallet to tracking"
echo "- /remove <wallet_address> - Remove wallet from tracking"
echo "- /list - List tracked wallets"
echo "- /help - Show help"
