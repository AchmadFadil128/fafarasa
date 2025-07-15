#!/bin/bash

# Script deployment untuk Fafa Rasa ERP dengan MySQL lokal
echo "=== Deploying Fafa Rasa ERP dengan MySQL Lokal ==="

# Stop dan remove container lama (jika ada)
echo "Stopping old containers..."
docker-compose down

# Remove old images (opsional)
echo "Removing old images..."
docker system prune -f

# Build dan start aplikasi
echo "Building and starting application..."
docker-compose up --build -d

# Check status
echo "Checking container status..."
docker-compose ps

echo "=== Deployment selesai! ==="
echo "Aplikasi berjalan di: http://localhost:8832"
echo "Database: MySQL lokal di VPS" 