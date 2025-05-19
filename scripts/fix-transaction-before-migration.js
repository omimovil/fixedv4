/**
 * Script para resolver el problema de transacción abortada antes de la migración
 * 
 * Este script se enfoca específicamente en resolver el error:
 * "MigrationError: Migration 5.0.0-05-drop-slug-fields-index (up) failed: Original error: 
 * current transaction is aborted, commands ignored until end of transaction block"
 * 
 * Se debe ejecutar antes de iniciar Strapi o ejecutar cualquier migración.
 */

const { Pool } = require('pg');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Cargar variables de entorno
dotenv.config();

// Determinar si estamos en Railway o entorno local
const isRailway = process.env.RAILWAY === 'true' || process.env.DATABASE_URL?.includes('railway.app');

// Configuración de conexión a PostgreSQL
let pgConfig;

if (isRailway) {
  // Configuración para Railway usando DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('Error: DATABASE_URL no está definida en el entorno Railway');
    process.exit(1);
  }
  
  pgConfig = { connectionString: databaseUrl };
  
  // Si SSL está habilitado
  if (process.env.DATABASE_SSL === 'true') {
    pgConfig.ssl = { rejectUnauthorized: false };
  }
} else {
  // Configuración para entorno local
  pgConfig = {
    user: process.env.DATABASE_USERNAME || 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    database: process.env.DATABASE_NAME || 'fixedv4',
    password: process.env.DATABASE_PASSWORD || 'ominey',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
  };
}

async function fixTransactionBeforeMigration() {
  let client = null;
  let pool = null;
  
  try {
    console.log('=== SOLUCIÓN PARA ERROR DE TRANSACCIÓN ABORTADA ===');
    console.log(`Entorno detectado: ${isRailway ? 'Railway' : 'Local'}`);
    console.log('Conectando a PostgreSQL...');
    
    pool = new Pool(pgConfig);
    client = await pool.connect();
    
    // PASO 1: Verificar conexión a la base de datos
    console.log('\nPASO 1: Verificando conexión a PostgreSQL...');
    const dbCheck = await client.query('SELECT 1 as check');
    if (dbCheck.rows[0].check === 1) {
      console.log('✅ Conexión exitosa a PostgreSQL');
    } else {
      throw new Error('No se pudo verificar la conexión a PostgreSQL');
    }
    
    // PASO 2: Finalizar todas las transacciones abortadas
    console.log('\nPASO 2: Finalizando transacciones abortadas...');
    await client.query('ROLLBACK');
    console.log('✅ Transacciones abortadas finalizadas');
    
    // PASO 3: Verificar tabla de migraciones
    console.log('\nPASO 3: Verificando tabla de migraciones...');
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'strapi_migrations'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('✅ Tabla de migraciones encontrada');
      
      // PASO 4: Listar migraciones actuales
      console.log('\nPASO 4: Listando migraciones actuales...');
      const currentMigrations = await client.query('SELECT * FROM strapi_migrations ORDER BY id');
      console.log('Migraciones encontradas:', currentMigrations.rows.length);
      
      // Buscar la migración problemática
      const problematicMigration = currentMigrations.rows.find(m => 
        m.name.includes('5.0.0-05-drop-slug-fields-index'));
      
      if (problematicMigration) {
        console.log('⚠️ Encontrada la migración problemática:', problematicMigration.name);
        
        // PASO 5: Eliminar la migración problemática
        console.log('\nPASO 5: Eliminando la migración problemática...');
        await client.query(`
          DELETE FROM strapi_migrations 
          WHERE name LIKE '%5.0.0-05-drop-slug-fields-index%'
        `);
        console.log('✅ Migración problemática eliminada correctamente');
      } else {
        console.log('✅ No se encontró la migración problemática. No es necesario eliminarla.');
      }
    } else {
      console.log('⚠️ La tabla strapi_migrations no existe. Esto es normal si es la primera ejecución.');
    }
    
    // PASO 6: Verificar índices relacionados con slug
    console.log('\nPASO 6: Verificando índices relacionados con slug...');
    const slugIndexes = await client.query(`
      SELECT indexname, tablename FROM pg_indexes 
      WHERE indexname LIKE '%slug%'
    `);
    
    if (slugIndexes.rows.length > 0) {
      console.log(`Encontrados ${slugIndexes.rows.length} índices relacionados con slug:`);
      for (const idx of slugIndexes.rows) {
        console.log(`- ${idx.indexname} (tabla: ${idx.tablename})`);
      }
    } else {
      console.log('No se encontraron índices relacionados con slug.');
    }
    
    console.log('\n=== SOLUCIÓN COMPLETADA ===');
    console.log('\nAhora puedes intentar ejecutar Strapi o la migración nuevamente.');
    console.log('Si estás usando npm: npm run develop');
    console.log('Si estás usando yarn: yarn develop');
    
  } catch (error) {
    console.error('Error durante el proceso de solución:', error);
  } finally {
    if (client) client.release();
    if (pool) await pool.end();
  }
}

// Ejecutar la solución
fixTransactionBeforeMigration();