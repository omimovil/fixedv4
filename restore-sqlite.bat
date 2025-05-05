@echo off
REM Script para restaurar la configuración de SQLite en Windows

echo === Restaurando configuracion de SQLite ===

REM Restaurar archivo .env original
if exist .env.sqlite.backup (
  copy .env.sqlite.backup .env
  echo Archivo .env restaurado
) else (
  echo No se encontro backup del archivo .env
  echo Creando configuracion SQLite manualmente...
  
  echo HOST=0.0.0.0> .env
  echo PORT=1337>> .env
  echo APP_KEYS="toBeModified1,toBeModified2">> .env
  echo API_TOKEN_SALT=tobemodified>> .env
  echo ADMIN_JWT_SECRET=tobemodified>> .env
  echo TRANSFER_TOKEN_SALT=tobemodified>> .env
  echo JWT_SECRET=tobemodified>> .env
  echo.>> .env
  echo # Configuracion para SQLite (desarrollo local)>> .env
  echo DATABASE_CLIENT=sqlite>> .env
  echo DATABASE_FILENAME=.tmp/data.db>> .env
  echo.>> .env
  echo # Railway detectara automaticamente DATABASE_URL para PostgreSQL>> .env
  echo # No es necesario definir DATABASE_URL aqui, Railway lo proporciona automaticamente>> .env
  echo # durante el despliegue>> .env
  echo.>> .env
  echo # Indicador para scripts de migracion>> .env
  echo RAILWAY=false>> .env
)

REM Restaurar base de datos SQLite si existe backup
if exist backups\data.db.backup (
  if not exist .tmp mkdir .tmp
  copy backups\data.db.backup .tmp\data.db
  echo Base de datos SQLite restaurada
) else (
  echo No se encontro backup de la base de datos SQLite
)

echo === Restauracion completada ===
echo Ahora puedes ejecutar la aplicacion con SQLite nuevamente
pause