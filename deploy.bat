@echo off
echo 🚀 Starting Fafa Rasa deployment...

echo 📦 Stopping existing containers...
docker-compose down -v

echo 🧹 Cleaning up existing images...
docker-compose down --rmi all

echo 🔨 Building and starting application...
docker-compose up --build -d

echo ⏳ Waiting for services to be ready...
timeout /t 30 /nobreak > nul

echo 🔍 Checking service status...
docker-compose ps

echo ✅ Deployment complete! Application should be available at http://localhost:8832
echo 📊 To view logs: docker-compose logs -f
pause 