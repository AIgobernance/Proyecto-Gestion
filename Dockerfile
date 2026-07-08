FROM php:8.2-apache

# Install system dependencies
# chromium is kept for its shared libraries (libnss3, libatk, etc.) that Chrome needs
RUN apt-get update && apt-get install -y \
    curl \
    unzip \
    libpng-dev \
    libzip-dev \
    libxml2-dev \
    libpq-dev \
    git \
    chromium \
    fonts-freefont-ttf \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install PHP extensions (PostgreSQL instead of SQL Server)
RUN docker-php-ext-install bcmath gd zip dom pdo pdo_pgsql pgsql

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Node.js
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs \
    && rm -rf /var/lib/apt/lists/*

# Puppeteer will download its OWN Chrome binary compatible with its version.
# PUPPETEER_CACHE_DIR must be set BEFORE npm install and Chrome download.
# DO NOT set PUPPETEER_EXECUTABLE_PATH here — let Puppeteer find its own Chrome.
ENV PUPPETEER_CACHE_DIR=/var/cache/puppeteer

# Configure Apache DocumentRoot
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Force remove conflicting MPM symlinks directly (a2dismod is unreliable in Docker build)
RUN rm -f /etc/apache2/mods-enabled/mpm_event.load \
          /etc/apache2/mods-enabled/mpm_event.conf \
          /etc/apache2/mods-enabled/mpm_worker.load \
          /etc/apache2/mods-enabled/mpm_worker.conf \
    && ln -sf /etc/apache2/mods-available/mpm_prefork.load /etc/apache2/mods-enabled/mpm_prefork.load \
    && ln -sf /etc/apache2/mods-available/mpm_prefork.conf /etc/apache2/mods-enabled/mpm_prefork.conf

# Enable Apache mod_rewrite
RUN a2enmod rewrite

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Install PHP dependencies (skip check-sqlserver script)
RUN COMPOSER_ALLOW_SUPERUSER=1 composer install --no-dev --optimize-autoloader --no-interaction --no-scripts \
    && php artisan package:discover --ansi

# Install Node dependencies, build assets, then download Puppeteer's own compatible Chrome
# PUPPETEER_SKIP_CHROMIUM_DOWNLOAD must NOT be set so that npx puppeteer browsers install works
RUN npm install && npm run build && npx puppeteer browsers install chrome

# Set permissions (including the Puppeteer Chrome cache so www-data can execute it)
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 755 /var/cache/puppeteer

# Copy and configure entrypoint script
COPY docker-entrypoint.sh /usr/local/bin/docker-entrypoint.sh
RUN chmod +x /usr/local/bin/docker-entrypoint.sh

# Railway assigns PORT dynamically — expose 8080 as hint but entrypoint handles it
EXPOSE 8080

# Use entrypoint script for reliable port configuration
ENTRYPOINT ["/usr/local/bin/docker-entrypoint.sh"]
