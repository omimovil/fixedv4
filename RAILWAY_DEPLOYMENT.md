# Guía de Migración a PostgreSQL y Despliegue en Railway

## Migración de SQLite a PostgreSQL

Se ha configurado el proyecto para usar PostgreSQL en lugar de SQLite. Los cambios realizados son:

1. Se ha modificado el archivo `.env` para usar PostgreSQL como cliente de base de datos.
2. Se han agregado las variables de entorno necesarias para la conexión a PostgreSQL.

## Configuración Local

Para ejecutar el proyecto localmente con PostgreSQL:

1. Asegúrate de tener PostgreSQL instalado en tu máquina.
2. Crea una base de datos llamada `strapi` (o el nombre que prefieras).
3. Actualiza las credenciales en el archivo `.env` según tu configuración local:
   ```
   DATABASE_CLIENT=postgres
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_NAME=strapi
   DATABASE_USERNAME=tu_usuario
   DATABASE_PASSWORD=tu_contraseña
   ```

## Despliegue en Railway

Para desplegar en Railway:

1. Crea una cuenta en [Railway](https://railway.app/) si aún no tienes una.
2. Crea un nuevo proyecto y selecciona "Deploy from GitHub repository".
3. Conecta tu repositorio de GitHub.
4. Railway creará automáticamente una base de datos PostgreSQL.
5. En la sección de variables de entorno de tu proyecto en Railway, configura las siguientes variables:
   ```
   HOST=0.0.0.0
   PORT=1337
   APP_KEYS=tu_app_keys
   API_TOKEN_SALT=tu_api_token_salt
   ADMIN_JWT_SECRET=tu_admin_jwt_secret
   TRANSFER_TOKEN_SALT=tu_transfer_token_salt
   JWT_SECRET=tu_jwt_secret
   DATABASE_CLIENT=postgres
   ```

6. Railway proporcionará automáticamente la variable `DATABASE_URL` que contiene toda la información de conexión a la base de datos.
7. Asegúrate de que en el archivo `config/database.js` esté configurado para usar la variable `DATABASE_URL` cuando está disponible.

## Migración de Datos

Para migrar tus datos de SQLite a PostgreSQL:

1. Exporta tus datos de SQLite usando el panel de administración de Strapi (Configuración > Transferencia de contenido).
2. Importa los datos en tu nueva base de datos PostgreSQL usando la misma herramienta.

## Notas Importantes

- Asegúrate de que todas las variables de entorno sensibles estén configuradas correctamente en Railway.
- Railway asigna automáticamente un dominio para tu aplicación, que puedes personalizar en la configuración del proyecto.
- Para problemas con la migración de datos, consulta la [documentación oficial de Strapi](https://docs.strapi.io/dev-docs/data-management/transfer).