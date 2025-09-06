 # Use official PHP image with Apache
 FROM php:8.2-apache
 # Copy application source
COPY . /var/www/html

     # Expose port 80
EXPOSE 80
 # The base image already starts Apache in the foreground