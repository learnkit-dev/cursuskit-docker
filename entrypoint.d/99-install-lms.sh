#!/bin/sh
cd /var/www/html

export LICENSE_EMAIL=$(grep "LICENSE_EMAIL" .env | cut -d '=' -f2)
export LICENSE_KEY=$(grep "LICENSE_KEY" .env | cut -d '=' -f2)
export LMS_OWNER_USER=$(grep "LMS_OWNER_USER" .env | cut -d '=' -f2)
export DB_USE_FRESH=$(grep "DB_USE_FRESH" .env | cut -d '=' -f2)

# Create auth for the package
composer config http-basic.cursuskit.pkgdi.st $LICENSE_EMAIL $LICENSE_KEY

chown -R www-data:www-data /var/www/html

composer update --no-interaction

if [ "$DB_USE_FRESH" -eq 1 ]; then
echo "Start with a fresh database"
php artisan migrate:fresh
fi

php artisan key:generate

php artisan storage:link

php artisan vendor:publish --tag="lms-assets"
php artisan vendor:publish --tag="lms-icons"

php artisan migrate

php artisan filament:assets
php artisan h5p:install

php artisan lms:create-owner --email=$LMS_OWNER_USER --name=Owner --default-password
