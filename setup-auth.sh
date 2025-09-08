#!/bin/bash

echo "Setting up authentication for Fafarasa..."

# Check if .env file exists
if [ ! -f .env ]; then
    echo "Creating .env file from env.example..."
    cp env.example .env
    echo "Please update .env file with your database credentials and NextAuth secret"
    echo "Then run this script again"
    exit 1
fi

# Load environment variables
source .env

echo "Database URL: $DATABASE_URL"
echo "Admin Username: $ADMIN_USERNAME"
echo "Admin Password: $ADMIN_PASSWORD"

# Generate Prisma client
echo "Generating Prisma client..."
npx prisma generate

# Run database setup script
echo "Setting up database and admin user..."
node scripts/setup-auth.js

echo "Authentication setup completed!"
echo "You can now login with:"
echo "Username: $ADMIN_USERNAME"
echo "Password: $ADMIN_PASSWORD"
echo ""
echo "Start the development server with: npm run dev"
