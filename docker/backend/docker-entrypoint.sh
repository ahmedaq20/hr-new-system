#!/bin/sh
set -e

echo "Waiting for database to be ready..."
until php -r "
try {
    \$pdo = new PDO(
        'pgsql:host='.getenv('DB_HOST').';port='.getenv('DB_PORT').';dbname='.getenv('DB_DATABASE'),
        getenv('DB_USERNAME'),
        getenv('DB_PASSWORD'),
        [PDO::ATTR_TIMEOUT => 5]
    );
    \$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    \$pdo->query('SELECT 1');
    echo 'Database is ready';
    exit(0);
} catch (Exception \$e) {
    exit(1);
}
" 2>/dev/null; do
  echo "Database is unavailable - sleeping"
  sleep 2
done

echo "Database is ready!"

if [ -z "$APP_KEY" ] || [ "$APP_KEY" = "" ]; then
    echo "Generating application key..."
    php artisan key:generate --force
fi

echo "Running migrations..."
php artisan migrate --force

php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

php artisan config:cache
php artisan route:cache
php artisan view:cache

echo "Starting PHP-FPM..."
exec "$@"
