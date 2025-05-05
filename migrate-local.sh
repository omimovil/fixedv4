#!/bin/bash

# Script para migrar datos de SQLite a PostgreSQL localmente

echo "=== Iniciando migración local de SQLite a PostgreSQL ==="

# 1. Hacer backup de la base de datos SQLite actual
echo "Haciendo backup de la base de datos SQLite..."
mkdir -p backups
cp .tmp/data.db backups/data.db.backup

# 2. Exportar datos usando la herramienta de transferencia de Strapi
echo "Para exportar los datos, sigue estos pasos:"
echo "1. Inicia Strapi con 'npm run develop'"
echo "2. Ve al panel de administración > Configuración > Transferencia de contenido"
echo "3. Exporta todos tus datos a un archivo"
echo "4. Guarda el archivo de exportación"
echo "Presiona Enter cuando hayas completado estos pasos..."
read

# 3. Cambiar a PostgreSQL
echo "Cambiando configuración a PostgreSQL..."
cp .env .env.sqlite.backup
sed -i 's/DATABASE_CLIENT=sqlite/# DATABASE_CLIENT=sqlite/' .env
sed -i 's/DATABASE_FILENAME=.tmp\/data.db/# DATABASE_FILENAME=.tmp\/data.db/' .env
sed -i 's/# DATABASE_CLIENT=postgres/DATABASE_CLIENT=postgres/' .env
sed -i 's/# DATABASE_HOST=localhost/DATABASE_HOST=localhost/' .env
sed -i 's/# DATABASE_PORT=5432/DATABASE_PORT=5432/' .env
sed -i 's/# DATABASE_NAME=strapi/DATABASE_NAME=strapi/' .env
sed -i 's/# DATABASE_USERNAME=postgres/DATABASE_USERNAME=postgres/' .env
sed -i 's/# DATABASE_PASSWORD=postgres/DATABASE_PASSWORD=postgres/' .env
sed -i 's/# DATABASE_SSL=false/DATABASE_SSL=false/' .env

# 4. Importar datos
echo "Para importar los datos a PostgreSQL, sigue estos pasos:"
echo "1. Inicia Strapi con 'npm run develop'"
echo "2. Ve al panel de administración > Configuración > Transferencia de contenido"
echo "3. Importa el archivo que exportaste anteriormente"
echo "Presiona Enter cuando hayas completado estos pasos..."
read

echo "=== Migración local completada ==="
echo "Ahora puedes probar tu aplicación con PostgreSQL localmente"
echo "Para volver a SQLite, ejecuta: ./restore-sqlite.sh"