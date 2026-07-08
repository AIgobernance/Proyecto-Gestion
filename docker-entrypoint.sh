#!/bin/bash
set -e

# Railway injects $PORT dynamically. Default to 80 if not set (local dev).
LISTEN_PORT="${PORT:-80}"

echo "==> Starting Apache on port $LISTEN_PORT"

# 1. Remove conflicting MPM modules (safety net at runtime)
rm -f /etc/apache2/mods-enabled/mpm_event.load \
      /etc/apache2/mods-enabled/mpm_event.conf \
      /etc/apache2/mods-enabled/mpm_worker.load \
      /etc/apache2/mods-enabled/mpm_worker.conf

# 2. Rewrite ports.conf from scratch to avoid any sed parsing issues
cat > /etc/apache2/ports.conf <<EOF
# This file is managed by docker-entrypoint.sh
Listen ${LISTEN_PORT}

<IfModule ssl_module>
    Listen 443
</IfModule>

<IfModule mod_gnutls.c>
    Listen 443
</IfModule>
EOF

# 3. Update the default VirtualHost to match the port
sed -i "s/<VirtualHost \*:80>/<VirtualHost *:${LISTEN_PORT}>/g" /etc/apache2/sites-enabled/000-default.conf

# 4. Set ServerName to suppress the FQDN warning
echo "ServerName localhost" >> /etc/apache2/apache2.conf

# 5. Run Laravel storage link if needed (idempotent)
if [ ! -L /var/www/html/public/storage ]; then
    php artisan storage:link --force 2>/dev/null || true
fi

# 6. Start Apache in foreground (PID 1)
exec apache2-foreground
