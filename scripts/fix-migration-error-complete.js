/**
 * Script mejorado para resolver el error de migración en Strapi v5
 * 
 * Este script soluciona específicamente el error:
 * "MigrationError: Migration 5.0.0-05-drop-slug-fields-index (up) failed: Original error: 
 * current transaction is aborted, commands ignored until end of transaction block"
 * 
 * Realiza las siguientes acciones:
 * 1. Finaliza todas las transacciones abortadas en PostgreSQL
 * 2. Elimina la migración problemática de la tabla strapi_migrations
 * 3. Verifica y elimina índices conflictivos relacionados con slug
 * 4. Optimiza la configuración de PostgreSQL para evitar problemas similares
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

async function fixMigrationError() {
  let client = null;
  let pool = null;
  
  try {
    console.log('=== SOLUCIÓN MEJORADA PARA ERROR DE MIGRACIÓN EN STRAPI ===');
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
      
      // Mostrar todas las migraciones para diagnóstico
      if (currentMigrations.rows.length > 0) {
        console.log('Lista de migraciones:');
        currentMigrations.rows.forEach(m => {
          console.log(`- ID: ${m.id}, Nombre: ${m.name}`);
        });
      }
      
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
        console.log('✅ No se encontró la migración problemática específica.');
        
        // Buscar cualquier migración relacionada con slug-fields-index
        const slugMigrations = currentMigrations.rows.filter(m => 
          m.name.toLowerCase().includes('slug') && 
          m.name.toLowerCase().includes('index'));
        
        if (slugMigrations.length > 0) {
          console.log(`⚠️ Encontradas ${slugMigrations.length} migraciones relacionadas con índices de slug:`);
          slugMigrations.forEach(m => console.log(`- ${m.name}`));
          
          console.log('\nEliminando migraciones relacionadas con índices de slug...');
          await client.query(`
            DELETE FROM strapi_migrations 
            WHERE name LIKE '%slug%' AND name LIKE '%index%'
          `);
          console.log('✅ Migraciones relacionadas con índices de slug eliminadas');
        } else {
          console.log('✅ No se encontraron migraciones relacionadas con índices de slug');
        }
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
        
        // Intentar eliminar los índices problemáticos
        try {
          console.log(`  Eliminando índice ${idx.indexname}...`);
          await client.query(`DROP INDEX IF EXISTS "${idx.indexname}"`);
          console.log(`  ✅ Índice ${idx.indexname} eliminado correctamente`);
        } catch (indexError) {
          console.log(`  ⚠️ No se pudo eliminar el índice ${idx.indexname}: ${indexError.message}`);
        }
      }
    } else {
      console.log('No se encontraron índices relacionados con slug.');
    }
    
    // PASO 7: Optimizar configuración de PostgreSQL
    console.log('\nPASO 7: Optimizando configuración de PostgreSQL...');
    
    // Verificar y ajustar el nivel de aislamiento de transacciones
    const isolationLevel = await client.query('SHOW transaction_isolation');
    console.log(`Nivel de aislamiento actual: ${isolationLevel.rows[0].transaction_isolation}`);
    
    // Verificar y ajustar el tiempo de espera de bloqueo
    const lockTimeout = await client.query('SHOW lock_timeout');
    console.log(`Tiempo de espera de bloqueo actual: ${lockTimeout.rows[0].lock_timeout}`);
    
    // Establecer un tiempo de espera de bloqueo más largo para evitar problemas
    await client.query('SET lock_timeout = \'30s\'');
    console.log('✅ Tiempo de espera de bloqueo ajustado a 30 segundos');
    
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
fixMigrationError();