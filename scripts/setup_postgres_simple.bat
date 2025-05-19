@echo off
echo Configurando PostgreSQL para Strapi...

:: Definir la ruta completa de PostgreSQL
set PSQL_PATH="C:\Program Files\PostgreSQL\14\bin\psql.exe"

:: Verificar la conexión con PostgreSQL
echo Verificando conexión con PostgreSQL...
%PSQL_PATH% -U postgres -c "SELECT version();"

:: Crear el usuario strapi
echo Creando usuario strapi...
%PSQL_PATH% -U postgres -c "CREATE USER strapi WITH PASSWORD 'ominey';"

:: Crear la base de datos strapi
echo Creando base de datos strapi...
%PSQL_PATH% -U postgres -c "CREATE DATABASE strapi;"

:: Dar permisos al usuario strapi
echo Asignando permisos al usuario strapi...
%PSQL_PATH% -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE strapi TO strapi;"

:: Verificar que todo se configuró correctamente
echo Verificando configuración...
%PSQL_PATH% -U postgres -c "SELECT datname FROM pg_database WHERE datname = 'strapi';"
%PSQL_PATH% -U postgres -c "SELECT rolname FROM pg_roles WHERE rolname = 'strapi';"

echo Configuración completada!
pause
