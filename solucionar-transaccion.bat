@echo off
echo ===================================================
echo Solucionando error de transaccion abortada en Strapi
echo ===================================================
echo.
echo Este script resuelve el error:
echo "MigrationError: Migration 5.0.0-05-drop-slug-fields-index (up) failed"
echo "current transaction is aborted, commands ignored until end of transaction block"
echo.
echo Ejecutando script de solucion...

node "scripts/fix-transaction-before-migration.js"

IF %ERRORLEVEL% NEQ 0 (
    echo.
    echo ===================================================
    echo ERROR: No se pudo ejecutar el script correctamente.
    echo Asegurate de tener Node.js instalado y las dependencias necesarias.
    echo ===================================================
) ELSE (
    echo.
    echo ===================================================
    echo Proceso completado exitosamente.
    echo Ahora puedes iniciar Strapi con:
    echo npm run develop
    echo ===================================================
)

pause