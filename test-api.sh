#!/bin/bash

echo "🧪 Testing Blocktrain API..."

BASE_URL="http://localhost:3000"

# Test health endpoint
echo "1. Testing health endpoint..."
curl -s "$BASE_URL/health" | jq '.' || echo "Health check failed"

echo -e "\n2. Testing trade creation..."
# Test valid trade creation
echo "Creating BUY trade..."
curl -X POST "$BASE_URL/api/v1/trade" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "tokenAddress": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "tradeType": "BUY",
    "amount": 100,
    "priceAt": 1.5
  }' | jq '.' || echo "Trade creation failed"

echo -e "\nCreating SELL trade..."
curl -X POST "$BASE_URL/api/v1/trade" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "tokenAddress": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "tradeType": "SELL",
    "amount": 50,
    "priceAt": 1.8
  }' | jq '.' || echo "Trade creation failed"

echo -e "\n3. Testing recent trades..."
echo "Getting recent trades for wallet 1..."
curl -s "$BASE_URL/api/v1/recent-trades?walletAddress=0x1234567890123456789012345678901234567890&limit=5" | jq '.' || echo "Recent trades failed"

echo -e "\n4. Testing error handling..."
echo "Testing invalid trade type..."
curl -X POST "$BASE_URL/api/v1/trade" \
  -H "Content-Type: application/json" \
  -d '{
    "walletAddress": "0x1234567890123456789012345678901234567890",
    "tokenAddress": "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd",
    "tradeType": "INVALID",
    "amount": 100
  }' | jq '.' || echo "Error handling test failed"

echo -e "\nTesting missing wallet address..."
curl -s "$BASE_URL/api/v1/recent-trades?limit=5" | jq '.' || echo "Error handling test failed"

echo -e "\n✅ API testing complete!"
