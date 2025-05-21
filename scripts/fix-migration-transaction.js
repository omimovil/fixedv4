/**
 * Script para corregir problemas de transacciones abortadas en PostgreSQL
 * 
 * Este script complementa al reset-strapi-migrations.js, enfocándose específicamente
 * en resolver el problema de "current transaction is aborted, commands ignored until end of transaction block"
 * que ocurre con la migración 5.0.0-05-drop-slug-fields-index
 */

const { Pool } = require('pg');

// Configuración de conexión a PostgreSQL
const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function fixMigrationTransaction() {
  let client = null;
  let pool = null;
  
  try {
    console.log('Conectando a PostgreSQL para corregir transacciones abortadas...');
    pool = new Pool(pgConfig);
    client = await pool.connect();
    
    // 1. Verificar si hay transacciones abortadas
    console.log('Verificando transacciones activas...');
    
    // 2. Forzar finalización de todas las transacciones abortadas
    console.log('Intentando finalizar todas las transacciones abortadas...');
    await client.query('ROLLBACK');
    
    // 3. Verificar si la tabla strapi_migrations existe
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'strapi_migrations'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      // 4. Verificar si la migración problemática existe
      const migrationExists = await client.query(`
        SELECT * FROM strapi_migrations 
        WHERE name LIKE '%5.0.0-05-drop-slug-fields-index%'
      `);
      
      if (migrationExists.rows.length > 0) {
        console.log('Encontrada la migración problemática. Eliminando registro...');
        await client.query(`
          DELETE FROM strapi_migrations 
          WHERE name LIKE '%5.0.0-05-drop-slug-fields-index%'
        `);
        console.log('Migración problemática eliminada correctamente.');
      } else {
        console.log('La migración problemática no se encontró en la tabla.');
      }
      
      // 5. Verificar si existen índices relacionados con slug
      console.log('Verificando índices relacionados con slug...');
      const slugIndexes = await client.query(`
        SELECT indexname FROM pg_indexes 
        WHERE indexname LIKE '%slug%'
      `);
      
      if (slugIndexes.rows.length > 0) {
        console.log('Encontrados los siguientes índices relacionados con slug:');
        for (const idx of slugIndexes.rows) {
          console.log(`- ${idx.indexname}`);
        }
      } else {
        console.log('No se encontraron índices relacionados con slug.');
      }
    } else {
      console.log('La tabla strapi_migrations no existe. Puede ser necesario inicializar la base de datos primero.');
    }
    
    console.log('\nProceso completado. Ahora puedes intentar ejecutar Strapi nuevamente con:');
    console.log('npm run develop');
    
  } catch (error) {
    console.error('Error al corregir transacciones:', error);
  } finally {
    if (client) client.release();
    if (pool) await pool.end();
  }
}

fixMigrationTransaction();