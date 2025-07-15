#!/bin/bash

echo "🚀 Starting Fafa Rasa deployment..."

# Stop and remove existing containers
echo "📦 Stopping existing containers..."
docker-compose down -v

# Remove existing images to ensure fresh build
echo "🧹 Cleaning up existing images..."
docker-compose down --rmi all

# Build and start the application
echo "🔨 Building and starting application..."
docker-compose up --build -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose ps

echo "✅ Deployment complete! Application should be available at http://localhost:8832"
echo "📊 To view logs: docker-compose logs -f" 