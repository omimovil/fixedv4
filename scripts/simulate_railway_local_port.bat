@echo off
echo Simulando entorno de Railway (modo local)...

REM Guardar variables actuales
set CURRENT_DATABASE_URL=%DATABASE_URL%
set CURRENT_RAILWAY=%RAILWAY%
set CURRENT_PORT=%PORT%

REM Configurar variables de Railway sin SSL
set DATABASE_URL=postgresql://postgres:ominey@localhost:5432/fixedv4
set DATABASE_SSL=false
set DATABASE_SSL_REJECT_UNAUTHORIZED=false
set RAILWAY=true
set PORT=1338

echo Variables de entorno configuradas para Railway (modo local):
echo DATABASE_URL=%DATABASE_URL%
echo DATABASE_SSL=%DATABASE_SSL%
echo DATABASE_SSL_REJECT_UNAUTHORIZED=%DATABASE_SSL_REJECT_UNAUTHORIZED%
echo RAILWAY=%RAILWAY%
echo PORT=%PORT%

echo Iniciando Strapi en modo Railway (local)...
npm run develop

REM Restaurar variables originales
set DATABASE_URL=%CURRENT_DATABASE_URL%
set RAILWAY=%CURRENT_RAILWAY%
set PORT=%CURRENT_PORT%
