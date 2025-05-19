/**
 * Script para migración esencial de SQLite a PostgreSQL en Strapi v5
 * 
 * Este script se enfoca ÚNICAMENTE en los elementos esenciales para la migración,
 * permitiendo que Strapi regenere automáticamente las tablas del sistema.
 * 
 * No migra datos, ya que el usuario utilizará la herramienta de importación/exportación
 * de Strapi para esa tarea.
 */

const { Pool } = require('pg');
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

// Cargar variables de entorno
dotenv.config();

// Configuración de conexión a PostgreSQL
const pgConfig = {
  user: process.env.DATABASE_USERNAME || 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  database: process.env.DATABASE_NAME || 'fixedv4',
  password: process.env.DATABASE_PASSWORD || 'ominey',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false
};

// Lista de tablas que Strapi regenera automáticamente y NO necesitan ser migradas
const TABLAS_AUTOGENERADAS = [
  'strapi_migrations',
  'strapi_database_schema',
  'strapi_core_store_settings',
  'strapi_webhooks',
  'admin_permissions',
  'admin_users',
  'admin_roles',
  'admin_permissions_role_links',
  'admin_users_roles_links',
  'strapi_api_tokens',
  'strapi_api_token_permissions',
  'strapi_api_token_permissions_token_links',
  'strapi_transfer_tokens',
  'strapi_transfer_token_permissions',
  'strapi_transfer_token_permissions_token_links'
];

async function migracionEsencial() {
  let client = null;
  let pool = null;
  
  try {
    console.log('=== MIGRACIÓN ESENCIAL A POSTGRESQL ===');
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
    
    // PASO 2: Finalizar transacciones abortadas
    console.log('\nPASO 2: Finalizando transacciones abortadas...');
    await client.query('ROLLBACK');
    console.log('✅ Transacciones abortadas finalizadas');
    
    // PASO 3: Verificar y eliminar tablas autogeneradas si existen
    console.log('\nPASO 3: Verificando tablas autogeneradas...');
    
    for (const tabla of TABLAS_AUTOGENERADAS) {
      const tableExists = await client.query(`
        SELECT EXISTS (
          SELECT FROM information_schema.tables 
          WHERE table_schema = 'public' 
          AND table_name = '${tabla}'
        );
      `);
      
      if (tableExists.rows[0].exists) {
        console.log(`Eliminando tabla autogenerada: ${tabla}`);
        try {
          await client.query(`DROP TABLE IF EXISTS "${tabla}" CASCADE`);
          console.log(`✅ Tabla ${tabla} eliminada correctamente`);
        } catch (error) {
          console.warn(`⚠️ No se pudo eliminar la tabla ${tabla}: ${error.message}`);
        }
      } else {
        console.log(`Tabla ${tabla} no existe, no es necesario eliminarla`);
      }
    }
    
    // PASO 4: Verificar índices relacionados con slug (que causan problemas en la migración)
    console.log('\nPASO 4: Verificando índices relacionados con slug...');
    const slugIndexes = await client.query(`
      SELECT indexname, tablename FROM pg_indexes 
      WHERE indexname LIKE '%slug%'
    `);
    
    if (slugIndexes.rows.length > 0) {
      console.log(`Encontrados ${slugIndexes.rows.length} índices relacionados con slug:`);
      for (const idx of slugIndexes.rows) {
        console.log(`- ${idx.indexname} (tabla: ${idx.tablename})`);
        try {
          await client.query(`DROP INDEX IF EXISTS "${idx.indexname}"`);
          console.log(`✅ Índice ${idx.indexname} eliminado correctamente`);
        } catch (error) {
          console.warn(`⚠️ No se pudo eliminar el índice ${idx.indexname}: ${error.message}`);
        }
      }
    } else {
      console.log('No se encontraron índices relacionados con slug.');
    }
    
    // PASO 5: Instrucciones finales
    console.log('\n=== MIGRACIÓN ESENCIAL COMPLETADA ===');
    console.log('\nPara completar el proceso, sigue estos pasos:');
    console.log('1. Asegúrate de tener las variables de entorno correctas configuradas en .env:');
    console.log('   DATABASE_CLIENT=postgres');
    console.log('   DATABASE_HOST=localhost');
    console.log('   DATABASE_PORT=5432');
    console.log('   DATABASE_NAME=fixedv4');
    console.log('   DATABASE_USERNAME=postgres');
    console.log('   DATABASE_PASSWORD=ominey');
    console.log('   DATABASE_SSL=false');
    console.log('\n2. Inicia Strapi para que regenere las tablas del sistema:');
    console.log('   npm run develop');
    console.log('\n3. Usa la herramienta de transferencia de contenido de Strapi para importar tus datos:');
    console.log('   Panel de administración > Configuración > Transferencia de contenido');
    
  } catch (error) {
    console.error('Error durante el proceso de migración esencial:', error);
  } finally {
    if (client) client.release();
    if (pool) await pool.end();
  }
}

// Ejecutar la migración esencial
migracionEsencial();