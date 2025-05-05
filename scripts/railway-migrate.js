// Script para migrar automáticamente de SQLite a PostgreSQL en Railway
const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const config = require('./config');

// Determinar si estamos en Railway
const isRailway = process.env.RAILWAY === 'true' || process.env.RAILWAY_STATIC_URL || process.env.RAILWAY_ENVIRONMENT;

async function migrateToRailway() {
  console.log('=== Iniciando migración a PostgreSQL en Railway ===');
  
  if (!isRailway) {
    console.log('No estamos en Railway. Este script está diseñado para ejecutarse en Railway.');
    console.log('Para migración local, usa el script migrate-local.bat');
    return;
  }
  
  // Verificar que tenemos DATABASE_URL
  if (!process.env.DATABASE_URL) {
    console.error('ERROR: No se encontró la variable DATABASE_URL. Asegúrate de que el servicio PostgreSQL esté conectado.');
    process.exit(1);
  }
  
  console.log('Variable DATABASE_URL detectada correctamente');
  
  try {
    // Configurar conexión a PostgreSQL
    const pgConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    };
    
    // Conectar a PostgreSQL
    const pgClient = new Client(pgConfig);
    await pgClient.connect();
    console.log('Conexión a PostgreSQL establecida exitosamente');
    
    // Verificar si las tablas ya existen
    const { rows } = await pgClient.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    if (rows.length > 0) {
      console.log('Tablas encontradas en PostgreSQL:');
      rows.forEach(row => console.log(` - ${row.table_name}`));
      console.log('La base de datos ya parece estar configurada.');
    } else {
      console.log('No se encontraron tablas en PostgreSQL. La migración se realizará automáticamente cuando Strapi inicie.');
    }
    
    // Cerrar conexión
    await pgClient.end();
    
    console.log('=== Verificación de PostgreSQL completada ===');
    console.log('La aplicación está lista para usar PostgreSQL en Railway');
    
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  }
}

migrateToRailway();