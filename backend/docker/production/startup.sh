#!/bin/sh
set -e

# When the container is started with a command override (e.g. the queue
# worker service passing "php artisan queue:work ..."), run that command
# directly instead of booting nginx/php-fpm.
if [ "$#" -gt 0 ]; then
    exec "$@"
fi

echo "Waiting for database..."
until php artisan db:show > /dev/null 2>&1; do
    echo "Database is unavailable - sleeping"
    sleep 2
done
echo "Database is ready!"

echo "Checking for pending migrations..."
if php artisan migrate:status 2>/dev/null | grep -q "Pending"; then
    echo "Running migrations..."
    php artisan migrate --force --no-interaction
else
    echo "No pending migrations. Skipping..."
fi

php-fpm -D
exec nginx -g "daemon off;"
