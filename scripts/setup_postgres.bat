@echo off
echo Configurando PostgreSQL para Strapi...

:: Agregar PostgreSQL al PATH
set PATH=%PATH%;"C:\Program Files\PostgreSQL\14\bin"

:: Ejecutar el script SQL para configurar la base de datos
echo Ejecutando script SQL...
psql -U postgres -f "..\setup_postgres_db.sql"

:: Verificar que la configuración fue exitosa
echo Verificando configuración...
psql -U postgres -c "SELECT datname FROM pg_database WHERE datname = 'strapi';"
psql -U postgres -c "SELECT rolname FROM pg_roles WHERE rolname = 'strapi';"

echo Configuración completada!
