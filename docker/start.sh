#!/bin/bash

echo "Starting HRMS Application..."

if [ ! -f ../backend/.env ]; then
    echo "Creating ../backend/.env file from ../backend/.env.example..."
    cp ../backend/.env.example ../backend/.env
    echo ""
    echo "⚠️  IMPORTANT: Please edit backend/.env file with your production database credentials!"
    echo "   - Set DB_CONNECTION=pgsql"
    echo "   - Set DB_HOST=postgres"
    echo "   - Set DB_PORT=5432"
    echo "   - Set DB_DATABASE, DB_USERNAME, DB_PASSWORD"
    echo "   - Update APP_ENV=production and APP_DEBUG=false"
    echo "   - Generate APP_KEY: php artisan key:generate"
    echo ""
    read -p "Press Enter to continue after editing backend/.env (or Ctrl+C to cancel)..."
fi

echo "Building and starting Docker containers..."
docker-compose -f docker-compose.yml up -d --build

echo "Waiting for frontend build to complete..."
sleep 10

echo "Ensuring frontend files are copied..."
docker-compose -f docker-compose.yml exec -T frontend-builder sh -c "cp -r /app/dist/* /output/ 2>/dev/null || true"

echo "Application started!"
echo "Frontend: http://localhost"
echo "API: http://localhost/api/v1"
echo ""
echo "View logs: docker-compose -f docker-compose.yml logs -f"
echo "Stop: docker-compose -f docker-compose.yml down"
