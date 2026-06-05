FROM php:8.2-apache

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gnupg2 \
    curl \
    apt-transport-https \
    unzip \
    libpng-dev \
    libzip-dev \
    libxml2-dev \
    git \
    unixodbc-dev

# Install Microsoft ODBC Driver 18 for SQL Server
RUN curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg \
    && curl https://packages.microsoft.com/config/debian/12/prod.list > /etc/apt/sources.list.d/mssql-release.list \
    && apt-get update \
    && ACCEPT_EULA=Y apt-get install -y msodbcsql18

# Install PHP extensions
RUN docker-php-ext-install bcmath gd zip dom
RUN pecl install sqlsrv-5.11.1 pdo_sqlsrv-5.11.1 \
    && docker-php-ext-enable sqlsrv pdo_sqlsrv

# Install Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Install Node.js (for Vite build)
RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash - \
    && apt-get install -y nodejs

# Configure Apache DocumentRoot
ENV APACHE_DOCUMENT_ROOT /var/www/html/public
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Configure Railway dynamic PORT
ENV PORT=80
RUN sed -i 's/80/${PORT}/g' /etc/apache2/sites-available/000-default.conf /etc/apache2/ports.conf

# Enable Apache mod_rewrite and fix MPM issue physically
RUN a2enmod rewrite mpm_prefork \
    && rm -f /etc/apache2/mods-enabled/mpm_event.load /etc/apache2/mods-enabled/mpm_worker.load \
    && rm -f /etc/apache2/mods-available/mpm_event.load /etc/apache2/mods-available/mpm_worker.load

# Set working directory
WORKDIR /var/www/html

# Copy application files
COPY . .

# Install PHP dependencies
RUN composer install --no-dev --optimize-autoloader --no-interaction

# Install Node dependencies and build assets
RUN npm install \
    && npm run build

# Set permissions
RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache \
    && chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

# Expose port 80
EXPOSE 80

# Start Apache
CMD ["apache2-foreground"]
