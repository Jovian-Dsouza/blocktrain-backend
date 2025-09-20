# Blocktrain Backend

A TypeScript Express server with Prisma ORM for PostgreSQL database.

## Features

- Express.js server with TypeScript
- Prisma ORM for PostgreSQL
- Trade event management API
- CORS and security middleware
- Error handling

## API Endpoints

### POST /api/v1/trade
Create a new trade event.

**Request Body:**
```json
{
  "walletAddress": "0x...",
  "tokenAddress": "0x...",
  "tradeType": "BUY" | "SELL",
  "amount": 100,
  "tradedAt": "2024-01-01T00:00:00Z",
  "priceAt": 1.5
}
```

### GET /api/v1/recent-trades
Get recent trades for a wallet.

**Query Parameters:**
- `walletAddress` (required): Wallet address to filter by
- `limit` (optional): Number of results to return (default: 5, max: 100)
- `cursor` (optional): ISO timestamp for pagination

**Response:**
```json
{
  "limit": 5,
  "cursor": "2024-01-01T00:00:00Z",
  "data": [
    {
      "id": "uuid",
      "walletAddress": "0x...",
      "tokenAddress": "0x...",
      "tradeType": "BUY",
      "amount": 100,
      "tradedAt": "2024-01-01T00:00:00Z",
      "priceAt": 1.5
    }
  ]
}
```

## Quick Setup

### Option 1: Docker (Recommended)
```bash
# Automated setup with Docker PostgreSQL
./setup-docker.sh

# Or manually:
docker-compose up -d postgres
cp env.docker.example .env
cp prisma/schema.postgresql.prisma prisma/schema.prisma
npx prisma generate && npx prisma db push
npm run dev
```

### Option 2: Local Development
```bash
# Run the setup script
./setup.sh

# Then edit .env with your database URL and run:
npm run db:push
npm run dev
```

## Manual Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp env.example .env
# Edit .env with your database URL
```

3. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push
```

4. Start the development server:
```bash
npm run dev
```

## Testing

Test the API endpoints:
```bash
./test-api.sh
```

Or test individual endpoints:
```bash
# Health check
curl http://localhost:3000/health

# Create trade
curl -X POST http://localhost:3000/api/v1/trade \
  -H "Content-Type: application/json" \
  -d '{"walletAddress":"0x123...","tokenAddress":"0xabc...","tradeType":"BUY","amount":100,"priceAt":1.5}'

# Get recent trades
curl "http://localhost:3000/api/v1/recent-trades?walletAddress=0x123...&limit=5"
```

## Docker Services

When using Docker, the following services are available:

- **API Server**: http://localhost:3000
- **PostgreSQL**: localhost:5432 (blocktrain/blocktrain_user/blocktrain_password)
- **pgAdmin**: http://localhost:8080 (admin@blocktrain.com/admin123)

### Docker Commands
```bash
# Start services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Reset everything (WARNING: deletes data)
docker-compose down -v
```

## Database Schema

The `events` table stores trade information:

- `id`: UUID primary key
- `walletAddress`: Wallet address (string)
- `token1`: Token address (string)
- `amount1`: Token amount (float, nullable)
- `token2`: Second token address (string)
- `amount2`: Second token amount (float, nullable)
- `tradeType`: BUY or SELL enum
- `priceAt`: Price at time of trade (float, nullable)
- `tradedAt`: Timestamp (defaults to current time)

## Scripts

- `npm run dev`: Start development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Start production server
- `npm run db:generate`: Generate Prisma client
- `npm run db:push`: Push schema changes to database
- `npm run db:migrate`: Create and run migrations
- `npm run db:studio`: Open Prisma Studio
