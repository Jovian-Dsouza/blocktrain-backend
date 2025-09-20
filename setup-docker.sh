#!/bin/bash

echo "🐳 Setting up Blocktrain Backend with Docker PostgreSQL..."

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo "❌ Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

echo "✅ Docker and Docker Compose are installed"

# Stop any existing containers
echo "🛑 Stopping existing containers..."
docker-compose down

# Start PostgreSQL container
echo "🚀 Starting PostgreSQL container..."
docker-compose up -d postgres

# Wait for PostgreSQL to be ready
echo "⏳ Waiting for PostgreSQL to be ready..."
until docker-compose exec postgres pg_isready -U blocktrain_user -d blocktrain; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

echo "✅ PostgreSQL is ready!"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Switch to PostgreSQL schema
echo "🔄 Switching to PostgreSQL schema..."
cp prisma/schema.postgresql.prisma prisma/schema.prisma

# Set up environment for Docker
echo "📝 Setting up environment for Docker..."
cp env.docker.example .env

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Push schema to database
echo "🗄️  Creating database schema..."
npx prisma db push

# Build the project
echo "🔨 Building TypeScript..."
npm run build

echo "✅ Docker setup complete!"
echo ""
echo "🐳 Docker services running:"
echo "  - PostgreSQL: localhost:5432"
echo "  - pgAdmin: http://localhost:8080 (admin@blocktrain.com / admin123)"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start the development server"
echo "2. Test the API with './test-api.sh'"
echo "3. Access pgAdmin at http://localhost:8080 to manage the database"
echo ""
echo "To stop Docker services: docker-compose down"
echo "To start Docker services: docker-compose up -d"
