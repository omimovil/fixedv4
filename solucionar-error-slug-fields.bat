@echo off
echo ===================================================
echo  SOLUCIONADOR DE ERROR DE MIGRACION SLUG FIELDS
echo ===================================================
echo.

echo Este script solucionara el problema especifico con la migracion
echo 5.0.0-05-drop-slug-fields-index que esta causando errores.
echo.

echo Ejecutando solucion...
echo.

node "scripts/fix-slug-fields-migration.js"

echo.
echo ===================================================
echo  PROCESO COMPLETADO
echo ===================================================
echo.
echo Ahora puedes intentar ejecutar Strapi nuevamente con:
echo npm run develop
echo.

pause