# SpotMap - Dockerfile para producción
###########
# Builder stage: instalar dependencias PHP sin arrastrar herramientas al final
###########
FROM php:8.2-cli AS builder

RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    git \
    && docker-php-ext-install pdo pdo_pgsql zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Copiar composer desde imagen oficial
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

WORKDIR /app/backend
COPY backend/composer.json backend/composer.lock* ./
RUN composer install --no-dev --prefer-dist --optimize-autoloader || true

###########
# Runtime stage
###########
FROM php:8.2-apache

# Metadata
LABEL maintainer="antonio-valero"
LABEL description="SpotMap - Aplicación de mapeo de spots"
LABEL version="1.0.0"

# Instalar extensiones PHP necesarias
RUN apt-get update && apt-get install -y \
    libpq-dev \
    libzip-dev \
    zip \
    unzip \
    && docker-php-ext-install pdo pdo_pgsql zip \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

## No copiamos composer al final (imagen más ligera). Si se necesita en desarrollo, añadirlo.

# Habilitar mod_rewrite para Apache
RUN a2enmod rewrite headers expires

# Configurar Apache
ENV APACHE_DOCUMENT_ROOT=/var/www/html/frontend
RUN sed -ri -e 's!/var/www/html!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/sites-available/*.conf
RUN sed -ri -e 's!/var/www/!${APACHE_DOCUMENT_ROOT}!g' /etc/apache2/apache2.conf /etc/apache2/conf-available/*.conf

# Configurar permisos de upload
RUN mkdir -p /var/www/html/backend/public/uploads && \
    chown -R www-data:www-data /var/www/html && \
    chmod -R 755 /var/www/html

WORKDIR /var/www/html
COPY frontend ./frontend
COPY backend ./backend
COPY nginx.conf .
COPY docker-compose.yml .
COPY vercel.json .

# Copiar dependencias PHP generadas en builder (vendor)
COPY --from=builder /app/backend/vendor ./backend/vendor

# Eliminar archivos que no son necesarios en runtime dentro de la imagen
RUN rm -rf ./backend/tests || true

# Configurar .htaccess para SPA routing
RUN echo '<IfModule mod_rewrite.c>\n\
    RewriteEngine On\n\
    RewriteBase /\n\
    RewriteRule ^index\.html$ - [L]\n\
    RewriteCond %{REQUEST_FILENAME} !-f\n\
    RewriteCond %{REQUEST_FILENAME} !-d\n\
    RewriteRule . /index.html [L]\n\
</IfModule>' > /var/www/html/frontend/.htaccess

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD curl -f http://localhost/backend/public/index.php/api/status || exit 1

# Exponer puerto
EXPOSE 80

# Usuario no root (seguridad)
USER www-data

# Comando de inicio
CMD ["apache2-foreground"]
