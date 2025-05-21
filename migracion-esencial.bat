@echo off
echo ===================================================
echo MIGRACIÓN ESENCIAL A POSTGRESQL PARA STRAPI v5
echo ===================================================
echo.
echo Este script realizará una migración mínima y esencial:
echo - NO migrará datos (usar herramienta de importación/exportación)
echo - NO migrará tablas que Strapi regenera automáticamente
echo - Solucionará problemas de transacciones abortadas
echo - Eliminará índices problemáticos relacionados con slug
echo.
echo Ejecutando migración esencial...
echo.

node scripts/migracion-esencial.js

echo.
echo ===================================================
echo Después de la migración esencial, sigue estos pasos:
echo.
echo 1. Inicia Strapi para regenerar las tablas del sistema:
echo    npm run develop
echo.
echo 2. Usa la herramienta de transferencia de contenido para importar datos:
echo    Panel de administración > Configuración > Transferencia de contenido
echo ===================================================

pause