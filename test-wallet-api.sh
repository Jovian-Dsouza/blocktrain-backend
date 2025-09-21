#!/bin/bash

# Test script for Wallet Tracker APIs
BASE_URL="http://localhost:3000/api/v1"

echo "🧪 Testing Wallet Tracker APIs"
echo "================================"

# Test 1: Dashboard Stats
echo "1. Testing Dashboard Stats..."
curl -s "$BASE_URL/dashboard/stats" | jq '.' || echo "Failed to get dashboard stats"

echo -e "\n"

# Test 2: Create a wallet
echo "2. Creating a test wallet..."
WALLET_RESPONSE=$(curl -s -X POST "$BASE_URL/wallets" \
  -H "Content-Type: application/json" \
  -d '{
    "address": "0x1234567890abcdef1234567890abcdef12345678",
    "name": "Test Trading Wallet",
    "description": "A test wallet for API testing"
  }')

echo "$WALLET_RESPONSE" | jq '.' || echo "Failed to create wallet"

# Extract wallet ID for further tests
WALLET_ID=$(echo "$WALLET_RESPONSE" | jq -r '.id' 2>/dev/null)

echo -e "\n"

# Test 3: Get all wallets
echo "3. Getting all wallets..."
curl -s "$BASE_URL/wallets" | jq '.' || echo "Failed to get wallets"

echo -e "\n"

# Test 4: Get specific wallet
if [ "$WALLET_ID" != "null" ] && [ "$WALLET_ID" != "" ]; then
  echo "4. Getting specific wallet ($WALLET_ID)..."
  curl -s "$BASE_URL/wallets/$WALLET_ID" | jq '.' || echo "Failed to get specific wallet"
  
  echo -e "\n"
  
  # Test 5: Create a trade for the wallet
  echo "5. Creating a trade for the wallet..."
  curl -s -X POST "$BASE_URL/trade" \
    -H "Content-Type: application/json" \
    -d "{
      \"walletAddress\": \"0x1234567890abcdef1234567890abcdef12345678\",
      \"tokenAddress\": \"0xabcdef1234567890abcdef1234567890abcdef12\",
      \"tradeType\": \"BUY\",
      \"amount\": 1000,
      \"priceAt\": 1.5
    }" | jq '.' || echo "Failed to create trade"
  
  echo -e "\n"
  
  # Test 6: Get wallet transactions
  echo "6. Getting wallet transactions..."
  curl -s "$BASE_URL/wallets/$WALLET_ID/transactions" | jq '.' || echo "Failed to get wallet transactions"
  
  echo -e "\n"
  
  # Test 7: Get wallet performance
  echo "7. Getting wallet performance..."
  curl -s "$BASE_URL/wallets/$WALLET_ID/performance" | jq '.' || echo "Failed to get wallet performance"
  
  echo -e "\n"
  
  # Test 8: Search wallets
  echo "8. Searching wallets..."
  curl -s "$BASE_URL/wallets/search?query=Test" | jq '.' || echo "Failed to search wallets"
  
  echo -e "\n"
  
  # Test 9: Export wallets
  echo "9. Exporting wallets..."
  curl -s "$BASE_URL/wallets/export" | jq '.' || echo "Failed to export wallets"
  
  echo -e "\n"
  
  # Test 10: Update wallet
  echo "10. Updating wallet..."
  curl -s -X PUT "$BASE_URL/wallets/$WALLET_ID" \
    -H "Content-Type: application/json" \
    -d '{
      "name": "Updated Test Wallet",
      "description": "Updated description"
    }' | jq '.' || echo "Failed to update wallet"
  
  echo -e "\n"
  
  # Test 11: Delete wallet
  echo "11. Deleting wallet..."
  curl -s -X DELETE "$BASE_URL/wallets/$WALLET_ID" || echo "Failed to delete wallet"
  
  echo -e "\n"
else
  echo "Skipping wallet-specific tests (wallet creation failed)"
fi

echo "✅ API testing completed!"
