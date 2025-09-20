# Docker Setup for Blocktrain Backend

This guide covers running the Blocktrain backend with Docker and PostgreSQL.

## Quick Start

### 1. Development Setup
```bash
# Run the automated setup
./setup-docker.sh

# Or manually:
docker-compose up -d postgres
cp env.docker.example .env
cp prisma/schema.postgresql.prisma prisma/schema.prisma
npx prisma generate
npx prisma db push
npm run dev
```

### 2. Production Setup
```bash
# Build and run with production configuration
docker-compose -f docker-compose.prod.yml up -d
```

## Docker Services

### PostgreSQL Database
- **Port**: 5432
- **Database**: blocktrain
- **Username**: blocktrain_user
- **Password**: blocktrain_password
- **Health Check**: Built-in PostgreSQL health check

### pgAdmin (Development Only)
- **URL**: http://localhost:8080
- **Email**: admin@blocktrain.com
- **Password**: admin123
- **Server**: postgres:5432

## Available Commands

### Development
```bash
# Start all services
docker-compose up -d

# Start only PostgreSQL
docker-compose up -d postgres

# View logs
docker-compose logs -f postgres

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes data)
docker-compose down -v
```

### Production
```bash
# Start production services
docker-compose -f docker-compose.prod.yml up -d

# View production logs
docker-compose -f docker-compose.prod.yml logs -f

# Stop production services
docker-compose -f docker-compose.prod.yml down
```

### Database Management
```bash
# Connect to PostgreSQL
docker-compose exec postgres psql -U blocktrain_user -d blocktrain

# Run Prisma commands
npx prisma db push
npx prisma migrate dev
npx prisma studio

# Backup database
docker-compose exec postgres pg_dump -U blocktrain_user blocktrain > backup.sql

# Restore database
docker-compose exec -T postgres psql -U blocktrain_user -d blocktrain < backup.sql
```

## Environment Variables

### Development (.env)
```env
DATABASE_URL="postgresql://blocktrain_user:blocktrain_password@localhost:5432/blocktrain?schema=public"
PORT=3000
NODE_ENV=development
```

### Production
```env
POSTGRES_DB=blocktrain
POSTGRES_USER=blocktrain_user
POSTGRES_PASSWORD=your_secure_password
NODE_ENV=production
```

## Troubleshooting

### Common Issues

1. **Port already in use**
   ```bash
   # Check what's using port 5432
   lsof -i :5432
   
   # Kill the process or change port in docker-compose.yml
   ```

2. **Database connection refused**
   ```bash
   # Check if PostgreSQL is running
   docker-compose ps
   
   # Check logs
   docker-compose logs postgres
   ```

3. **Permission denied**
   ```bash
   # Fix file permissions
   sudo chown -R $USER:$USER .
   ```

4. **Prisma client out of sync**
   ```bash
   # Regenerate Prisma client
   npx prisma generate
   
   # Reset database
   npx prisma db push --force-reset
   ```

### Reset Everything
```bash
# Stop and remove all containers and volumes
docker-compose down -v
docker system prune -f

# Rebuild and start
./setup-docker.sh
```

## File Structure

```
blocktrain-backend/
├── docker-compose.yml          # Main Docker Compose config
├── docker-compose.override.yml # Development overrides
├── docker-compose.prod.yml     # Production config
├── Dockerfile                  # Application Docker image
├── init-scripts/               # Database initialization scripts
│   └── 01-init.sql
├── env.docker.example          # Docker environment template
└── setup-docker.sh            # Automated setup script
```

## Security Notes

- Change default passwords in production
- Use Docker secrets for sensitive data
- Don't expose database ports in production
- Use HTTPS in production
- Regularly update base images

## Performance Tips

- Use named volumes for better performance
- Set appropriate memory limits
- Use connection pooling
- Monitor resource usage with `docker stats`
