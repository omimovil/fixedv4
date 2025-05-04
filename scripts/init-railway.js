// Script de inicialización para Railway
const fs = require('fs');
const path = require('path');

// Verificar si estamos en Railway
const isRailway = process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_ENVIRONMENT;

if (isRailway) {
  console.log('Detectado entorno de Railway');
  
  // Establecer la variable RAILWAY=true para que los scripts de migración sepan que estamos en Railway
  process.env.RAILWAY = 'true';
  
  // Verificar que tenemos DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: No se encontró la variable DATABASE_URL. Asegúrate de que el servicio PostgreSQL esté conectado.');
    process.exit(1);
  }
  
  console.log('Variable DATABASE_URL detectada correctamente');
  
  // Verificar la ruta de la base de datos SQLite
  const sqliteDbPath = process.env.SQLITE_DB_PATH || '/app/.tmp/data.db';
  console.log(`Ruta de la base de datos SQLite: ${sqliteDbPath}`);
  
  // Crear el directorio para la base de datos SQLite si no existe
  const dbDir = path.dirname(sqliteDbPath);
  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`Directorio creado: ${dbDir}`);
    } catch (error) {
      console.error(`Error al crear directorio ${dbDir}:`, error);
    }
  }
  
  console.log('Inicialización completada. Listo para migrar datos.');
} else {
  console.log('No estamos en Railway. Saltando inicialización.');
}