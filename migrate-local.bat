@echo off
REM Script para migrar datos de SQLite a PostgreSQL localmente en Windows

echo === Iniciando migracion local de SQLite a PostgreSQL ===

REM 1. Hacer backup de la base de datos SQLite actual
echo Haciendo backup de la base de datos SQLite...
if not exist backups mkdir backups
if exist .tmp\data.db copy .tmp\data.db backups\data.db.backup

REM 2. Exportar datos usando la herramienta de transferencia de Strapi
echo Para exportar los datos, sigue estos pasos:
echo 1. Inicia Strapi con 'npm run develop'
echo 2. Ve al panel de administracion ^> Configuracion ^> Transferencia de contenido
echo 3. Exporta todos tus datos a un archivo
echo 4. Guarda el archivo de exportacion
echo Presiona Enter cuando hayas completado estos pasos...
pause

REM 3. Crear archivo .env.migration para PostgreSQL
echo Creando archivo .env.migration para PostgreSQL...
copy .env .env.sqlite.backup

REM Crear archivo .env.postgres con la configuración de PostgreSQL
echo HOST=0.0.0.0> .env.postgres
echo PORT=1337>> .env.postgres
echo APP_KEYS="toBeModified1,toBeModified2">> .env.postgres
echo API_TOKEN_SALT=tobemodified>> .env.postgres
echo ADMIN_JWT_SECRET=tobemodified>> .env.postgres
echo TRANSFER_TOKEN_SALT=tobemodified>> .env.postgres
echo JWT_SECRET=tobemodified>> .env.postgres
echo.>> .env.postgres
echo DATABASE_CLIENT=postgres>> .env.postgres
echo DATABASE_HOST=localhost>> .env.postgres
echo DATABASE_PORT=5432>> .env.postgres
echo DATABASE_NAME=strapi>> .env.postgres
echo DATABASE_USERNAME=postgres>> .env.postgres
echo DATABASE_PASSWORD=postgres>> .env.postgres
echo DATABASE_SSL=false>> .env.postgres

echo Cambiando configuracion a PostgreSQL...
copy .env.postgres .env

REM 4. Importar datos
echo Para importar los datos a PostgreSQL, sigue estos pasos:
echo 1. Inicia Strapi con 'npm run develop'
echo 2. Ve al panel de administracion ^> Configuracion ^> Transferencia de contenido
echo 3. Importa el archivo que exportaste anteriormente
echo Presiona Enter cuando hayas completado estos pasos...
pause

echo === Migracion local completada ===
echo Ahora puedes probar tu aplicacion con PostgreSQL localmente
echo Para volver a SQLite, ejecuta: restore-sqlite.bat
pause