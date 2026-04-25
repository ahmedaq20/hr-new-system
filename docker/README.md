# Docker Setup for HRMS Application

This Docker setup containerizes the Laravel backend and React frontend applications.

## Architecture

- **PostgreSQL**: Database server
- **Backend**: Laravel application running PHP-FPM
- **Frontend Builder**: Builds the React application
- **Nginx**: Web server that:
  - Serves React app at root (`/`)
  - Proxies `/api` requests to Laravel backend

## Prerequisites

- Docker and Docker Compose installed
- Environment variables configured (see `.env.example`)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
# Database (PostgreSQL)
DB_DATABASE=ministry_hrms
DB_USERNAME=postgres
DB_PASSWORD=postgres
DB_PORT=5432

# Application
APP_ENV=production
APP_DEBUG=false
APP_PORT=80

# Frontend API URL
VITE_API_BASE_URL=http://localhost/api/v1
```

## Usage

### Build and Start Services

```bash
# Build and start all services
docker-compose up -d --build

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Stop and remove volumes (WARNING: deletes database data)
docker-compose down -v
```

### Rebuild Frontend

If you need to rebuild the frontend:

```bash
# Rebuild frontend container
docker-compose build frontend-builder

# Restart frontend builder to copy new build
docker-compose restart frontend-builder
```

### Access the Application

- Frontend: http://localhost
- API: http://localhost/api/v1

## Features

1. **Automatic Migrations**: The backend automatically runs `php artisan migrate --force` on container start/restart
2. **Database Health Checks**: Backend waits for database to be ready before starting
3. **Optimized Builds**: Frontend is built with production optimizations
4. **Persistent Storage**: Database and application storage are persisted in Docker volumes

## Troubleshooting

### Database Connection Issues

If the backend can't connect to the database:
1. Check that PostgreSQL container is running: `docker-compose ps`
2. Verify database credentials in `.env`
3. Check backend logs: `docker-compose logs backend`
4. Check PostgreSQL logs: `docker-compose logs postgres`

### Frontend Not Updating

If frontend changes aren't reflected:
1. Rebuild frontend: `docker-compose build frontend-builder`
2. Restart frontend builder: `docker-compose restart frontend-builder`
3. Clear browser cache

### Migration Errors

If migrations fail:
1. Check backend logs: `docker-compose logs backend`
2. Ensure database is accessible
3. Verify migration files are correct

## Development

For development, you may want to:
- Mount source code as volumes for hot-reloading
- Use `APP_DEBUG=true` for detailed error messages
- Access containers: `docker-compose exec backend bash`
