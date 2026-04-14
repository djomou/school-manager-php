FROM php:8.2-cli
RUN docker-php-ext-install pdo pdo_mysql
WORKDIR /app
COPY . .
EXPOSE 3001
CMD ["php", "-S", "0.0.0.0:3001", "index.php"]
