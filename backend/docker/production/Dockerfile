# syntax=docker/dockerfile:1

# ================================
# Stage 1: PHP dependencies
# ================================
FROM composer:2 AS composer-builder

WORKDIR /app

COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-interaction

COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative --no-dev

# ================================
# Stage 2: Runtime
# ================================
FROM php:8.4-fpm-alpine

WORKDIR /var/www/html

RUN apk add --no-cache \
        autoconf \
        gcc \
        g++ \
        make \
        libc-dev \
        linux-headers \
        postgresql-dev \
        libzip-dev \
        libpng-dev \
        libjpeg-turbo-dev \
        freetype-dev \
        oniguruma-dev \
        icu-dev \
        nginx \
    && docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_pgsql \
        opcache \
        bcmath \
        zip \
        gd \
        intl \
    && pecl install redis \
    && docker-php-ext-enable redis \
    && apk del autoconf gcc g++ make libc-dev linux-headers \
    && rm -rf /tmp/* /var/cache/apk/*

RUN echo '[PHP]' > /usr/local/etc/php/conf.d/php-production.ini \
    && echo 'post_max_size = 100M' >> /usr/local/etc/php/conf.d/php-production.ini \
    && echo 'upload_max_filesize = 100M' >> /usr/local/etc/php/conf.d/php-production.ini \
    && echo 'memory_limit = 256M' >> /usr/local/etc/php/conf.d/php-production.ini \
    && echo 'opcache.enable=1' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'opcache.memory_consumption=128' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'opcache.max_accelerated_files=10000' >> /usr/local/etc/php/conf.d/opcache.ini \
    && echo 'opcache.validate_timestamps=0' >> /usr/local/etc/php/conf.d/opcache.ini

COPY --from=composer-builder /app/vendor ./vendor
COPY --from=composer-builder /app ./

COPY docker/production/nginx.conf /etc/nginx/http.d/default.conf
COPY docker/production/startup.sh /usr/local/bin/startup.sh

RUN chmod +x /usr/local/bin/startup.sh \
    && mkdir -p storage/framework/cache storage/framework/sessions storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache \
    && chmod -R 775 storage bootstrap/cache

EXPOSE 80

ENTRYPOINT ["/usr/local/bin/startup.sh"]
