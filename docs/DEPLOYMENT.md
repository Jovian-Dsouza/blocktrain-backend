# Deployment Guide

## Production Setup with PostgreSQL

1. **Switch to PostgreSQL schema:**
   ```bash
   cp prisma/schema.postgresql.prisma prisma/schema.prisma
   cp env.postgresql.example .env
   ```

2. **Update environment variables:**
   Edit `.env` with your PostgreSQL connection details:
   ```
   DATABASE_URL="postgresql://username:password@host:port/database?schema=public"
   PORT=3000
   NODE_ENV=production
   ```

3. **Deploy:**
   ```bash
   npm install --production
   npm run db:generate
   npm run db:push
   npm run build
   npm start
   ```

## Docker Deployment

Create a `Dockerfile`:
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npx prisma generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
```

## Environment Variables

- `DATABASE_URL`: PostgreSQL connection string
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment (development/production)

## Database Migrations

For production, use migrations instead of `db:push`:
```bash
npx prisma migrate dev --name init
npx prisma migrate deploy
```
