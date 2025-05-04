# Pasos para Completar la Migración a PostgreSQL

## Estado Actual

- El proyecto está configurado para detectar automáticamente si está en Railway usando la variable `DATABASE_URL`
- La dependencia `pg` ya está instalada (versión ^8.15.6)
- Actualmente el proyecto está usando SQLite en desarrollo local

## Pasos para Completar la Migración

### 1. Configurar PostgreSQL Localmente (Opcional)

Si deseas probar PostgreSQL en tu entorno local antes de desplegar a Railway:

1. Instala PostgreSQL en tu máquina local si aún no lo tienes
2. Crea una base de datos para el proyecto:
   ```sql
   CREATE DATABASE strapi;
   ```
3. Modifica tu archivo `.env` para usar PostgreSQL:
   ```
   DATABASE_CLIENT=postgres
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=strapi
   DATABASE_USERNAME=tu_usuario
   DATABASE_PASSWORD=tu_contraseña
   ```

### 2. Migrar Datos de SQLite a PostgreSQL

1. Antes de cambiar a PostgreSQL, exporta tus datos actuales:
   - Ve al panel de administración de Strapi
   - Navega a Configuración > Transferencia de contenido
   - Exporta todos tus datos a un archivo

2. Después de configurar PostgreSQL, importa los datos:
   - Usa la misma herramienta de Transferencia de contenido
   - Importa el archivo que exportaste anteriormente

### 3. Despliegue en Railway

1. Asegúrate de que tu repositorio esté actualizado en GitHub
2. Conecta tu repositorio a Railway
3. Railway detectará automáticamente que es una aplicación Strapi
4. Configura las siguientes variables de entorno en Railway:
   - `DATABASE_CLIENT=postgres`
   - Todas las variables de entorno de Strapi (APP_KEYS, API_TOKEN_SALT, etc.)
   - Railway proporcionará automáticamente la variable `DATABASE_URL`

5. Verifica que el archivo `config/database.js` esté configurado correctamente (ya lo está)

### 4. Verificación Final

- Asegúrate de que todas las variables de entorno sensibles estén configuradas en Railway
- Verifica que la aplicación se inicie correctamente
- Comprueba que puedes acceder al panel de administración
- Verifica que todos tus datos se hayan migrado correctamente

## Notas Adicionales

- Si encuentras problemas con la migración de datos, consulta la [documentación oficial de Strapi](https://docs.strapi.io/dev-docs/data-management/transfer)
- Railway asigna automáticamente un dominio para tu aplicación, que puedes personalizar en la configuración del proyecto
- Para entornos de producción, asegúrate de configurar correctamente las variables de entorno relacionadas con la seguridad