#!/bin/bash

# Script para restaurar la configuración de SQLite

echo "=== Restaurando configuración de SQLite ==="

# Restaurar archivo .env original
if [ -f .env.sqlite.backup ]; then
  cp .env.sqlite.backup .env
  echo "Archivo .env restaurado"
else
  echo "No se encontró backup del archivo .env"
  # Restaurar manualmente
  sed -i 's/# DATABASE_CLIENT=sqlite/DATABASE_CLIENT=sqlite/' .env
  sed -i 's/# DATABASE_FILENAME=.tmp\/data.db/DATABASE_FILENAME=.tmp\/data.db/' .env
  sed -i 's/DATABASE_CLIENT=postgres/# DATABASE_CLIENT=postgres/' .env
  sed -i 's/DATABASE_HOST=localhost/# DATABASE_HOST=localhost/' .env
  sed -i 's/DATABASE_PORT=5432/# DATABASE_PORT=5432/' .env
  sed -i 's/DATABASE_NAME=strapi/# DATABASE_NAME=strapi/' .env
  sed -i 's/DATABASE_USERNAME=postgres/# DATABASE_USERNAME=postgres/' .env
  sed -i 's/DATABASE_PASSWORD=postgres/# DATABASE_PASSWORD=postgres/' .env
  sed -i 's/DATABASE_SSL=false/# DATABASE_SSL=false/' .env
fi

# Restaurar base de datos SQLite si existe backup
if [ -f backups/data.db.backup ]; then
  cp backups/data.db.backup .tmp/data.db
  echo "Base de datos SQLite restaurada"
else
  echo "No se encontró backup de la base de datos SQLite"
fi

echo "=== Restauración completada ==="
echo "Ahora puedes ejecutar la aplicación con SQLite nuevamente"