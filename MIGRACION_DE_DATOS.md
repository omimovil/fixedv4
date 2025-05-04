# Guía para Migrar Datos de SQLite a PostgreSQL en Railway

## Problema Actual

Has migrado correctamente la estructura de la base de datos a PostgreSQL en Railway, pero los datos que tenías en SQLite no se han transferido automáticamente. Esto es normal porque al cambiar de sistema de base de datos, solo se migra la estructura (tablas, relaciones, etc.) pero no los datos.

## Solución: Exportar e Importar Datos

Para transferir tus datos de SQLite a PostgreSQL, necesitas usar la herramienta de "Transferencia de contenido" de Strapi. A continuación se detallan los pasos:

### Paso 1: Configurar Strapi para usar SQLite localmente

1. Modifica el archivo `.env` para usar SQLite:
   ```
   # Configuración para SQLite (desarrollo local)
   DATABASE_CLIENT=sqlite
   DATABASE_FILENAME=.tmp/data.db
   
   # Comenta temporalmente las variables de PostgreSQL
   # DATABASE_URL=postgres://...
   ```

2. Modifica el archivo `config/database.js` para usar SQLite:
   ```javascript
   const path = require('path');
   
   module.exports = ({ env }) => {
     return {
       connection: {
         client: 'sqlite',
         connection: {
           filename: path.join(
             __dirname,
             '..',
             env('DATABASE_FILENAME', '.tmp/data.db')
           ),
         },
         useNullAsDefault: true,
       },
     };
   };
   ```

3. Inicia Strapi en modo desarrollo:
   ```
   npm run develop
   ```

### Paso 2: Exportar los datos de SQLite

1. Accede al panel de administración de Strapi (http://localhost:1337/admin)
2. Ve a Configuración > Transferencia de contenido
3. Haz clic en "Exportar"
4. Selecciona todos los tipos de contenido que deseas exportar
5. Haz clic en "Exportar" y guarda el archivo .tar.gz generado

### Paso 3: Configurar Strapi para usar PostgreSQL

1. Modifica el archivo `.env` para usar PostgreSQL:
   ```
   # Configuración para PostgreSQL (Railway)
   DATABASE_CLIENT=postgres
   DATABASE_URL=postgres://pguser:pgpassword@shinkansen.proxy.rlwy.net:5432/pgdatabase
   ```

2. Restaura el archivo `config/database.js` original que detecta automáticamente si estás en Railway:
   ```javascript
   const path = require('path');
   
   module.exports = ({ env }) => {
     // Detecta automáticamente si estamos en Railway usando la variable DATABASE_URL
     const useRailway = env('DATABASE_URL', null) !== null && env('DATABASE_URL', '').length > 0;
     
     // Si estamos en Railway, usa postgres, de lo contrario usa sqlite para desarrollo local
     const client = useRailway ? 'postgres' : 'sqlite';
   
     const connections = {
       // ... resto del código original
     };
   
     return {
       connection: {
         client,
         ...connections[client],
         acquireConnectionTimeout: env.int('DATABASE_CONNECTION_TIMEOUT', 60000),
       },
     };
   };
   ```

3. Inicia Strapi nuevamente:
   ```
   npm run develop
   ```

### Paso 4: Importar los datos a PostgreSQL

1. Accede al panel de administración de Strapi
2. Ve a Configuración > Transferencia de contenido
3. Haz clic en "Importar"
4. Selecciona el archivo .tar.gz que exportaste anteriormente
5. Haz clic en "Importar"

### Paso 5: Verificar la migración

1. Después de la importación, verifica que todos tus datos estén correctamente migrados
2. Navega por las diferentes colecciones y tipos de contenido para asegurarte de que todos los datos están presentes

## Configuración para Railway

Si estás desplegando en Railway, asegúrate de que las siguientes variables de entorno estén configuradas:

```
DATABASE_CLIENT=postgres
DATABASE_URL=${DATABASE_URL} (Railway proporciona esta variable automáticamente)
DATABASE_SSL=true
DATABASE_SSL_REJECT_UNAUTHORIZED=false
```

## Solución de problemas

- **Error de conexión a PostgreSQL**: Asegúrate de que la URL de conexión sea correcta y que el servidor PostgreSQL esté accesible.
- **Error durante la importación**: Verifica que la versión de Strapi sea la misma en ambos entornos.
- **Datos faltantes**: Asegúrate de haber seleccionado todos los tipos de contenido durante la exportación.

## Recursos adicionales

- [Documentación oficial de Strapi sobre transferencia de datos](https://docs.strapi.io/dev-docs/data-management/transfer)
- [Guía de despliegue en Railway](https://docs.strapi.io/dev-docs/deployment/railway)

---

Si encuentras algún problema durante el proceso, no dudes en consultar la documentación oficial de Strapi o buscar ayuda en la comunidad.