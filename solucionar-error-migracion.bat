@echo off
echo ===================================================
echo SOLUCIONADOR MEJORADO DE ERROR DE MIGRACION STRAPI v5
echo ===================================================
echo.
echo Este script solucionara el error:
echo "MigrationError: Migration 5.0.0-05-drop-slug-fields-index (up) failed"
echo "current transaction is aborted, commands ignored until end of transaction block"
echo.
echo Ejecutando solucion mejorada...
echo.

node scripts/fix-migration-error-complete.js

echo.
echo ===================================================
echo Si el problema persiste, prueba estos comandos:
echo.
echo 1. Establecer variables de entorno correctas:
echo    set DATABASE_CLIENT=postgres
echo    set DATABASE_HOST=localhost
echo    set DATABASE_PORT=5432
echo    set DATABASE_NAME=fixedv4
echo    set DATABASE_USERNAME=postgres
echo    set DATABASE_PASSWORD=ominey
echo    set DATABASE_SSL=false
echo.
echo 2. Ejecutar migracion manual si es necesario:
echo    node scripts/migrate-to-postgres-final.js
echo.
echo 3. Iniciar Strapi:
echo    npm run develop
echo ===================================================

pause