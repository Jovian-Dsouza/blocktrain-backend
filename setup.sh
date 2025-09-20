#!/bin/bash

echo "🚀 Setting up Blocktrain Backend..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

echo "✅ Node.js and npm are installed"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo "🔧 Generating Prisma client..."
npx prisma generate

# Check if .env exists
if [ ! -f .env ]; then
    echo "📝 Creating .env file from template..."
    cp env.example .env
    echo "⚠️  Please edit .env file with your database connection details"
else
    echo "✅ .env file already exists"
fi

# Build the project
echo "🔨 Building TypeScript..."
npm run build

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Edit .env file with your PostgreSQL database URL"
echo "2. Run 'npm run db:push' to create the database schema"
echo "3. Run 'npm run dev' to start the development server"
echo "4. Test the API with 'node test-api.js' (make sure server is running)"
