echo "Iniciando deploy..."

# Asegurarse de que estamos en la rama correcta
git checkout feature/migrate-sqlite-to-postgres

echo "Subiendo cambios..."
git push origin feature/migrate-sqlite-to-postgres

echo "Forzando deploy en Railway..."
# Esto forzará Railway a actualizar el proyecto
# Primero, vamos a hacer un push force para asegurarnos de que los cambios se apliquen
git push -f origin feature/migrate-sqlite-to-postgres

echo "¡Deploy completado!"
