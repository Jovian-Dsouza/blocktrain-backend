-- Initialize the blocktrain database
-- This script runs when the PostgreSQL container starts for the first time

-- Create the database if it doesn't exist (though it should already exist from POSTGRES_DB)
-- SELECT 'CREATE DATABASE blocktrain' WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'blocktrain')\gexec

-- Connect to the blocktrain database
\c blocktrain;

-- Create a schema for better organization (optional)
CREATE SCHEMA IF NOT EXISTS public;

-- Set timezone
SET timezone = 'UTC';

-- Create an index on wallet_address for better query performance
-- (This will be created by Prisma, but we can add it here as well)
-- CREATE INDEX IF NOT EXISTS idx_events_wallet_address ON events(wallet_address);
-- CREATE INDEX IF NOT EXISTS idx_events_traded_at ON events(traded_at);

-- Grant permissions
GRANT ALL PRIVILEGES ON DATABASE blocktrain TO blocktrain_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO blocktrain_user;
GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO blocktrain_user;
GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO blocktrain_user;

-- Set default privileges for future tables
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO blocktrain_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO blocktrain_user;
