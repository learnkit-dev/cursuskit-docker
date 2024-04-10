FROM serversideup/php:beta-8.2-unit

COPY --chmod=755 ./entrypoint.d/ /etc/entrypoint.d/

RUN install-php-extensions exif intl gd bcmath
