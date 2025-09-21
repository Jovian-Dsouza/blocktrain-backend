# Wallet Tracker API Documentation

This document describes the APIs required to support the Wallet Tracker frontend interface.

## Base URL
```
http://localhost:3000/api/v1
```

## Authentication
Currently, no authentication is required. In production, you should implement proper authentication.

## API Endpoints

### Dashboard Statistics

#### GET /dashboard/stats
Get overall dashboard statistics.

**Response:**
```json
{
  "totalWallets": 2,
  "totalProfit": 69000,
  "activeWallets": 2,
  "totalTransactions": 5
}
```

### Wallet Management

#### GET /wallets
Get all tracked wallets with optional statistics.

**Query Parameters:**
- `includeStats` (boolean, default: true) - Include wallet statistics

**Response:**
```json
[
  {
    "id": "uuid",
    "address": "0x1234...5678",
    "name": "Main Trading Wallet",
    "description": "Primary trading wallet",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z",
    "stats": {
      "totalProfit": 45600,
      "transactionCount": 3,
      "lastUpdate": "2024-01-01T12:00:00.000Z"
    }
  }
]
```

#### POST /wallets
Add a new wallet to track.

**Request Body:**
```json
{
  "address": "0x1234...5678",
  "name": "Main Trading Wallet",
  "description": "Primary trading wallet"
}
```

**Response:**
```json
{
  "id": "uuid",
  "address": "0x1234...5678",
  "name": "Main Trading Wallet",
  "description": "Primary trading wallet",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z"
}
```

#### GET /wallets/:id
Get specific wallet details.

**Query Parameters:**
- `includeStats` (boolean, default: true) - Include wallet statistics

**Response:**
```json
{
  "id": "uuid",
  "address": "0x1234...5678",
  "name": "Main Trading Wallet",
  "description": "Primary trading wallet",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T00:00:00.000Z",
  "stats": {
    "totalProfit": 45600,
    "transactionCount": 3,
    "lastUpdate": "2024-01-01T12:00:00.000Z"
  }
}
```

#### PUT /wallets/:id
Update wallet metadata.

**Request Body:**
```json
{
  "name": "Updated Wallet Name",
  "description": "Updated description",
  "isActive": true
}
```

**Response:**
```json
{
  "id": "uuid",
  "address": "0x1234...5678",
  "name": "Updated Wallet Name",
  "description": "Updated description",
  "isActive": true,
  "createdAt": "2024-01-01T00:00:00.000Z",
  "updatedAt": "2024-01-01T12:00:00.000Z"
}
```

#### DELETE /wallets/:id
Remove wallet from tracking.

**Response:**
```
204 No Content
```

### Wallet Search and Filtering

#### GET /wallets/search
Search wallets with various filters.

**Query Parameters:**
- `query` (string) - Search by address, name, or description
- `isActive` (boolean) - Filter by active status
- `minProfit` (number) - Minimum profit filter
- `maxProfit` (number) - Maximum profit filter
- `limit` (number, default: 10) - Number of results
- `offset` (number, default: 0) - Pagination offset

**Response:**
```json
{
  "wallets": [
    {
      "id": "uuid",
      "address": "0x1234...5678",
      "name": "Main Trading Wallet",
      "description": "Primary trading wallet",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z",
      "stats": {
        "totalProfit": 45600,
        "transactionCount": 3,
        "lastUpdate": "2024-01-01T12:00:00.000Z"
      }
    }
  ],
  "total": 1,
  "limit": 10,
  "offset": 0
}
```

### Wallet Details

#### GET /wallets/:id/transactions
Get transaction history for a specific wallet.

**Query Parameters:**
- `limit` (number, default: 10) - Number of transactions
- `cursor` (string) - Pagination cursor
- `tradeType` (string) - Filter by trade type (BUY/SELL)

**Response:**
```json
{
  "limit": 10,
  "cursor": "2024-01-01T12:00:00.000Z",
  "data": [
    {
      "id": "uuid",
      "walletAddress": "0x1234...5678",
      "tokenAddress": "0xabcd...efgh",
      "tradeType": "BUY",
      "amount": 1000,
      "tradedAt": "2024-01-01T12:00:00.000Z",
      "priceAt": 1.5
    }
  ]
}
```

#### GET /wallets/:id/performance
Get wallet performance over time.

**Query Parameters:**
- `days` (number, default: 30) - Number of days to analyze

**Response:**
```json
[
  {
    "date": "2024-01-01",
    "profit": 1500,
    "transactionCount": 2
  },
  {
    "date": "2024-01-02",
    "profit": -200,
    "transactionCount": 1
  }
]
```

### Export Functionality

#### GET /wallets/export
Export all wallet data.

**Query Parameters:**
- `format` (string, default: 'json') - Export format (json/csv)

**Response:**
- JSON format: Array of wallet objects with full details
- CSV format: CSV file download

### Trade Management (Existing)

#### POST /trade
Create a new trade event.

**Request Body:**
```json
{
  "walletAddress": "0x1234...5678",
  "tokenAddress": "0xabcd...efgh",
  "tradeType": "BUY",
  "amount": 1000,
  "tradedAt": "2024-01-01T12:00:00.000Z",
  "priceAt": 1.5
}
```

#### GET /recent-trades
Get recent trades for a wallet.

**Query Parameters:**
- `walletAddress` (string, required) - Wallet address
- `limit` (number, default: 5) - Number of trades
- `cursor` (string) - Pagination cursor

## Error Responses

All endpoints return appropriate HTTP status codes and error messages:

```json
{
  "error": "Error message description"
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `204` - No Content
- `400` - Bad Request
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error

## Frontend Integration

The Wallet Tracker interface would use these APIs as follows:

1. **Dashboard Load**: Call `/dashboard/stats` and `/wallets` to populate the summary cards and wallet list
2. **Add Wallet**: Use `POST /wallets` when the "Add" button is clicked
3. **Search**: Use `GET /wallets/search` for the search functionality
4. **Export**: Use `GET /wallets/export` for the export button
5. **Wallet Details**: Use `GET /wallets/:id` and `GET /wallets/:id/transactions` for detailed views
6. **Performance**: Use `GET /wallets/:id/performance` for performance charts

## Database Schema

The API uses the following main models:

- **Wallet**: Stores wallet metadata (address, name, description, status)
- **Event**: Stores trade events linked to wallets
- **TelegramUser**: Telegram bot users
- **WalletSubscription**: Telegram subscriptions to wallets

## Rate Limiting

Consider implementing rate limiting for production use to prevent abuse.

## Security Considerations

1. Implement proper authentication and authorization
2. Validate all input data
3. Sanitize user inputs
4. Implement CORS policies
5. Use HTTPS in production
6. Implement request logging and monitoring
