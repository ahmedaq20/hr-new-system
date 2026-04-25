FROM php:8.2-fpm-alpine

RUN apk add --no-cache \
    git \
    curl \
    zip \
    unzip \
    postgresql-client \
    nginx \
    supervisor \
    libpng \
    libjpeg-turbo \
    freetype \
    libzip \
    oniguruma

RUN apk add --no-cache --virtual .build-deps \
    autoconf \
    g++ \
    make \
    libpng-dev \
    libxml2-dev \
    libzip-dev \
    oniguruma-dev \
    postgresql-dev \
    freetype-dev \
    libjpeg-turbo-dev \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) pdo_pgsql pgsql mbstring exif pcntl bcmath gd opcache zip \
    && docker-php-ext-enable opcache \
    && apk del --purge .build-deps \
    && rm -rf /var/cache/apk/* /tmp/* /var/tmp/* \
    && find /usr/local/lib/php -name "*.a" -delete \
    && find /usr/local/lib/php -name "*.la" -delete

RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer --version=2.7.0 \
    && chmod +x /usr/local/bin/composer \
    && composer --version

WORKDIR /var/www/html

COPY backend/composer.json backend/composer.lock* ./

RUN set -eux; \
    if [ -f composer.lock ]; then \
        COMPOSER_MEMORY_LIMIT=-1 composer install --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts; \
    else \
        COMPOSER_MEMORY_LIMIT=-1 composer update --no-dev --optimize-autoloader --no-interaction --prefer-dist --no-scripts; \
    fi \
    && composer clear-cache

COPY docker/backend/docker-entrypoint.sh /usr/local/bin/
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

COPY backend/ .

RUN composer dump-autoload --optimize --no-dev --classmap-authoritative || true

RUN rm -rf storage/logs/* storage/framework/cache/* storage/framework/sessions/* storage/framework/views/* bootstrap/cache/* || true

RUN mkdir -p storage/logs storage/framework/cache storage/framework/sessions storage/framework/views bootstrap/cache \
    && chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

EXPOSE 9000

ENTRYPOINT ["docker-entrypoint.sh"]
CMD ["php-fpm"]
