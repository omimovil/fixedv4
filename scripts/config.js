// Configuración para scripts de migración
const path = require('path');
const fs = require('fs');

// Determinar la ruta de la base de datos SQLite
let sqliteDbPath = process.env.SQLITE_DB_PATH || path.join(__dirname, '../.tmp/data.db');

// Si estamos en Railway, asegurarse de que el directorio exista
if (process.env.RAILWAY === 'true') {
  const dbDir = path.dirname(sqliteDbPath);
  if (!fs.existsSync(dbDir)) {
    try {
      fs.mkdirSync(dbDir, { recursive: true });
      console.log(`Directorio creado: ${dbDir}`);
    } catch (error) {
      console.error(`Error al crear directorio ${dbDir}:`, error);
    }
  }
}

module.exports = {
  sqliteDbPath,
  isRailway: process.env.RAILWAY === 'true' || (process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0),
  pgConfig: process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: {
      rejectUnauthorized: false
    }
  } : null
};