@echo off
echo ===================================================
echo  SOLUCIONADOR DE PROBLEMAS DE MIGRACION MEJORADO
echo ===================================================
echo.

echo Este script solucionara los problemas de transaccion
echo que ocurren durante la migracion de SQLite a PostgreSQL.
echo.

echo Ejecutando solucion mejorada...
echo.

node "scripts/fix-migration-transaction-improved.js"

echo.
echo ===================================================
echo  PROCESO COMPLETADO
echo ===================================================
echo.
echo Ahora puedes intentar ejecutar Strapi nuevamente con:
echo npm run develop
echo.

pause