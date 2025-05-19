-- Crear usuario para Strapi
CREATE USER strapi WITH PASSWORD 'ominey';

-- Crear la base de datos para Strapi
CREATE DATABASE strapi;

-- Dar permisos al usuario
GRANT ALL PRIVILEGES ON DATABASE strapi TO strapi;

-- Verificar que todo está configurado correctamente
SELECT datname FROM pg_database WHERE datname = 'strapi';
SELECT rolname FROM pg_roles WHERE rolname = 'strapi';
