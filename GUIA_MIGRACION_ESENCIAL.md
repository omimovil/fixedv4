# Guía de Migración Esencial de SQLite a PostgreSQL en Strapi v5

## Enfoque de Migración Esencial

Esta guía presenta un enfoque optimizado para migrar de SQLite a PostgreSQL en Strapi v5, centrándose únicamente en los elementos esenciales y permitiendo que Strapi regenere automáticamente todo lo que puede manejar por sí mismo.

### ¿Por qué un enfoque esencial?

Al migrar de SQLite a PostgreSQL en Strapi v5, es importante entender que:

1. **Strapi regenera automáticamente** muchas tablas del sistema al iniciar con una nueva base de datos
2. **La migración de datos** es más segura usando la herramienta oficial de transferencia de contenido
3. **Las migraciones automáticas** de Strapi pueden causar problemas al intentar migrar tablas que Strapi maneja internamente

## Tablas que Strapi regenera automáticamente

Las siguientes tablas son gestionadas internamente por Strapi y **NO necesitan ser migradas manualmente**:

- `strapi_migrations` - Registro de migraciones de Strapi
- `strapi_database_schema` - Esquema de la base de datos
- `strapi_core_store_settings` - Configuraciones del core
- `strapi_webhooks` - Webhooks configurados
- `admin_permissions` - Permisos de administración
- `admin_users` - Usuarios administradores
- `admin_roles` - Roles de administración
- `admin_permissions_role_links` - Relaciones entre permisos y roles
- `admin_users_roles_links` - Relaciones entre usuarios y roles
- `strapi_api_tokens` - Tokens de API
- `strapi_api_token_permissions` - Permisos de tokens de API
- `strapi_api_token_permissions_token_links` - Relaciones de permisos de tokens
- `strapi_transfer_tokens` - Tokens de transferencia
- `strapi_transfer_token_permissions` - Permisos de tokens de transferencia
- `strapi_transfer_token_permissions_token_links` - Relaciones de permisos de tokens de transferencia

## Proceso de Migración Esencial

### 1. Preparación

1. **Hacer copia de seguridad** de la base de datos SQLite actual
2. **Verificar** que PostgreSQL esté correctamente instalado y configurado
3. **Configurar** las variables de entorno en `.env` para PostgreSQL:

```
DATABASE_CLIENT=postgres
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=fixedv4
DATABASE_USERNAME=postgres
DATABASE_PASSWORD=ominey
DATABASE_URL=postgresql://postgres:ominey@localhost:5432/fixedv4
DATABASE_SSL=false
```

### 2. Ejecutar la Migración Esencial

Ejecutar el script de migración esencial que hemos creado:

```
migracion-esencial.bat
```

Este script realiza las siguientes acciones:

- Verifica la conexión a PostgreSQL
- Finaliza cualquier transacción abortada
- Elimina tablas autogeneradas si existen (para evitar conflictos)
- Elimina índices problemáticos relacionados con slug

### 3. Iniciar Strapi con PostgreSQL

Una vez completada la migración esencial, inicia Strapi:

```
npm run develop
```

Strapi detectará automáticamente que está usando PostgreSQL y creará todas las tablas del sistema necesarias.

### 4. Migrar los Datos usando la Herramienta de Transferencia de Contenido

Para migrar los datos, usa la herramienta oficial de transferencia de contenido de Strapi:

1. **Exportar datos** de la instalación con SQLite:
   - Configura temporalmente Strapi para usar SQLite
   - Accede al panel de administración > Configuración > Transferencia de contenido
   - Exporta todos los tipos de contenido necesarios

2. **Importar datos** en la instalación con PostgreSQL:
   - Configura Strapi para usar PostgreSQL
   - Accede al panel de administración > Configuración > Transferencia de contenido
   - Importa el archivo exportado previamente

## Ventajas de este Enfoque

- **Menos propenso a errores**: Evita conflictos con las migraciones internas de Strapi
- **Más limpio**: Permite que Strapi cree tablas con la estructura correcta para la versión actual
- **Más seguro**: Utiliza la herramienta oficial de transferencia para los datos
- **Más rápido**: Evita migrar tablas y datos innecesarios

## Solución de Problemas

Si encuentras problemas durante la migración:

1. **Error de transacción abortada**: Ejecuta `solucionar-error-migracion.bat`
2. **Problemas con índices**: El script de migración esencial ya elimina índices problemáticos
3. **Tablas faltantes**: Strapi las regenerará automáticamente al iniciar

## Después de la Migración

Una vez completada la migración, verifica que:

1. Puedes acceder al panel de administración
2. Todos tus tipos de contenido están disponibles
3. Los datos importados son correctos
4. Las relaciones entre entidades funcionan correctamente

Si todo funciona correctamente, ¡has completado exitosamente la migración esencial a PostgreSQL!