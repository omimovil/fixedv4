# Migración de SQLite a PostgreSQL con Strapi

Este directorio contiene los scripts de migración para transferir datos de SQLite a PostgreSQL utilizando el sistema de migraciones nativo de Strapi.

## Archivos de Migración

- `01-sqlite-to-postgres.js`: Script principal que migra todos los datos de SQLite a PostgreSQL manteniendo las relaciones entre tablas.

## Cómo Ejecutar la Migración

Strapi proporciona comandos para ejecutar migraciones. Para ejecutar esta migración, sigue estos pasos:

### 1. Preparación

Asegúrate de tener configuradas correctamente las variables de entorno:

- Para desarrollo local con PostgreSQL:
  ```
  DATABASE_CLIENT=postgres
  DATABASE_HOST=localhost
  DATABASE_PORT=5432
  DATABASE_NAME=fixedv4
  DATABASE_USERNAME=postgres
  DATABASE_PASSWORD=ominey
  DATABASE_SSL=false
  ```

- Para Railway:
  ```
  DATABASE_CLIENT=postgres
  DATABASE_URL=${DATABASE_URL} (Railway proporciona esta variable automáticamente)
  DATABASE_SSL=true
  DATABASE_SSL_REJECT_UNAUTHORIZED=false
  ```

### 2. Ejecutar la Migración

Utiliza el siguiente comando para ejecutar la migración:

```bash
npx strapi migration:run
```

Este comando ejecutará todas las migraciones pendientes en orden.

### 3. Verificar la Migración

Para verificar que la migración se ha ejecutado correctamente, puedes usar el script de prueba:

```bash
node scripts/test-postgres.js
```

Este script mostrará todas las tablas existentes en la base de datos PostgreSQL.

## Notas Importantes

- La migración solo se ejecutará una vez. Si necesitas volver a ejecutarla, deberás restablecer el estado de las migraciones.
- Asegúrate de tener una copia de seguridad de tus datos antes de ejecutar la migración.
- Si encuentras algún problema durante la migración, revisa los logs para identificar el error.

## Solución de Problemas

Si encuentras errores durante la migración, verifica lo siguiente:

1. Asegúrate de que la base de datos SQLite existe y es accesible.
2. Verifica que la conexión a PostgreSQL está configurada correctamente.
3. Comprueba que tienes permisos suficientes para escribir en la base de datos PostgreSQL.
4. Si hay errores específicos con alguna tabla, puedes modificar el script para omitir esa tabla y continuar con el resto.

## Migración Manual

Si prefieres ejecutar la migración manualmente sin usar el sistema de migraciones de Strapi, puedes usar los scripts existentes en la carpeta `scripts/`:

```bash
node scripts/migrate-to-postgres-final.js
```

Este enfoque puede ser útil si necesitas más control sobre el proceso de migración.