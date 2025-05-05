# Guía Completa para Migrar de SQLite a PostgreSQL

Esta guía te ayudará a migrar tu aplicación Strapi de SQLite a PostgreSQL, primero probando localmente y luego desplegando en Railway.

## Requisitos Previos

1. PostgreSQL instalado localmente (para pruebas)
2. Una cuenta en Railway
3. Git instalado

## Parte 1: Migración Local (SQLite a PostgreSQL)

### Paso 1: Preparar la Base de Datos PostgreSQL Local

1. Instala PostgreSQL si aún no lo tienes:
   - Windows: Descarga e instala desde [postgresql.org](https://www.postgresql.org/download/windows/)
   - Durante la instalación, anota la contraseña del usuario postgres

2. Crea una base de datos para Strapi:
   - Abre pgAdmin o la herramienta que prefieras
   - Crea una nueva base de datos llamada `strapi`

### Paso 2: Exportar Datos de SQLite

1. Ejecuta el script de migración local:
   ```
   migrate-local.bat
   ```

2. Sigue las instrucciones en pantalla:
   - El script hará un backup de tu base de datos SQLite
   - Te pedirá que inicies Strapi y exportes los datos

3. Para exportar los datos:
   - Inicia Strapi con `npm run develop`
   - Ve al panel de administración > Configuración > Transferencia de contenido
   - Selecciona "Exportar"
   - Marca todos los tipos de contenido
   - Descarga el archivo de exportación

### Paso 3: Cambiar a PostgreSQL Localmente

1. El script `migrate-local.bat` ya habrá modificado tu archivo `.env` para usar PostgreSQL

2. Reinicia Strapi:
   ```
   npm run develop
   ```

3. Importa los datos:
   - Ve al panel de administración > Configuración > Transferencia de contenido
   - Selecciona "Importar"
   - Sube el archivo que exportaste anteriormente

4. Verifica que todo funcione correctamente

### Paso 4: Volver a SQLite (Opcional)

Si necesitas volver a SQLite después de probar:

```
restore-sqlite.bat
```

## Parte 2: Despliegue en Railway

### Paso 1: Preparar el Repositorio

1. Asegúrate de que todos los cambios estén confirmados en Git

2. Crea una nueva rama para la migración (opcional):
   ```
   git checkout -b feature/migrate-to-postgres
   ```

### Paso 2: Configurar Railway

1. Inicia sesión en [Railway](https://railway.app/)

2. Crea un nuevo proyecto o selecciona uno existente

3. Agrega un servicio PostgreSQL:
   - Haz clic en "New"
   - Selecciona "Database" > "PostgreSQL"

4. Conecta tu repositorio de GitHub:
   - Haz clic en "New"
   - Selecciona "GitHub Repo"
   - Elige tu repositorio

5. Configura las variables de entorno:
   - Railway proporcionará automáticamente `DATABASE_URL`
   - Agrega las siguientes variables:
     ```
     DATABASE_CLIENT=postgres
     DATABASE_SSL=true
     DATABASE_SSL_REJECT_UNAUTHORIZED=false
     NODE_ENV=production
     ```
   - Agrega también las variables de Strapi (APP_KEYS, JWT_SECRET, etc.)

### Paso 3: Desplegar

1. Railway detectará automáticamente que es una aplicación Strapi

2. El despliegue se iniciará automáticamente

3. Durante el despliegue, el script `migrate.js` migrará los datos de SQLite a PostgreSQL

4. Una vez completado, haz clic en "Generate Domain" para obtener una URL pública

## Solución de Problemas

### Problemas Comunes en la Migración Local

1. **Error de conexión a PostgreSQL**:
   - Verifica que PostgreSQL esté en ejecución
   - Comprueba las credenciales en el archivo `.env`
   - Asegúrate de que la base de datos `strapi` exista

2. **Error durante la importación**:
   - Verifica que la versión de Strapi sea la misma en ambos entornos
   - Intenta reiniciar Strapi

### Problemas Comunes en Railway

1. **Error en el despliegue**:
   - Revisa los logs para identificar el problema
   - Verifica que todas las variables de entorno estén configuradas correctamente

2. **Error "Not Found" después del despliegue**:
   - Asegúrate de que la aplicación se haya construido correctamente
   - Verifica que el puerto configurado sea 1337

3. **Problemas con la migración de datos**:
   - Puedes intentar migrar manualmente usando la herramienta de transferencia de contenido de Strapi

## Comandos Útiles

- **Iniciar Strapi en desarrollo**: `npm run develop`
- **Construir Strapi**: `npm run build`
- **Iniciar Strapi en producción**: `npm run start`
- **Migrar datos localmente**: `migrate-local.bat`
- **Restaurar SQLite**: `restore-sqlite.bat`

## Recursos Adicionales

- [Documentación oficial de Strapi sobre transferencia de datos](https://docs.strapi.io/dev-docs/data-management/transfer)
- [Guía de despliegue en Railway](https://docs.strapi.io/dev-docs/deployment/railway)
- [Documentación de PostgreSQL](https://www.postgresql.org/docs/)

---

Si encuentras algún problema durante el proceso, no dudes en consultar la documentación oficial o buscar ayuda en la comunidad de Strapi.