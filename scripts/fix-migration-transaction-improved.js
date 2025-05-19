/**
 * Script mejorado para resolver problemas de transacción durante la migración a PostgreSQL
 * 
 * Este script aborda específicamente los errores de "Transaction query already complete"
 * que ocurren durante la migración de SQLite a PostgreSQL.
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

async function fixMigrationTransactions() {
  let client = null;
  let pool = null;
  
  try {
    console.log('=== SOLUCIÓN MEJORADA PARA ERRORES DE TRANSACCIÓN EN MIGRACIÓN ===');
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
    
    // PASO 3: Verificar y limpiar tablas problemáticas
    console.log('\nPASO 3: Verificando tablas problemáticas...');
    
    // Lista de tablas que han mostrado problemas durante la migración
    const problematicTables = [
      'available_categories',
      'categories',
      'products',
      'brands',
      'colors',
      'shopping_carts'
    ];
    
    for (const tableName of problematicTables) {
      try {
        // Verificar si la tabla existe
        const tableExists = await client.query(`
          SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' 
            AND table_name = $1
          );
        `, [tableName]);
        
        if (tableExists.rows[0].exists) {
          console.log(`Tabla ${tableName} encontrada, limpiando datos...`);
          
          // Intentar eliminar datos fuera de una transacción
          try {
            await client.query(`TRUNCATE TABLE ${tableName} CASCADE;`);
            console.log(`✅ Tabla ${tableName} limpiada correctamente`);
          } catch (truncateError) {
            console.warn(`⚠️ No se pudo limpiar la tabla ${tableName} con TRUNCATE: ${truncateError.message}`);
            
            // Intentar con DELETE si TRUNCATE falla
            try {
              await client.query(`DELETE FROM ${tableName};`);
              console.log(`✅ Tabla ${tableName} limpiada con DELETE`);
            } catch (deleteError) {
              console.error(`❌ No se pudo limpiar la tabla ${tableName}: ${deleteError.message}`);
            }
          }
        } else {
          console.log(`Tabla ${tableName} no existe, no es necesario limpiarla`);
        }
      } catch (error) {
        console.error(`Error al procesar tabla ${tableName}: ${error.message}`);
      }
    }
    
    // PASO 4: Verificar tabla de migraciones
    console.log('\nPASO 4: Verificando tabla de migraciones...');
    const migrationsTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'strapi_migrations'
      );
    `);
    
    if (migrationsTableExists.rows[0].exists) {
      console.log('✅ Tabla de migraciones encontrada');
      
      // Listar migraciones actuales
      const currentMigrations = await client.query('SELECT * FROM strapi_migrations ORDER BY id');
      console.log(`Migraciones encontradas: ${currentMigrations.rows.length}`);
      
      // Buscar la migración de SQLite a PostgreSQL
      const sqliteMigration = currentMigrations.rows.find(m => 
        m.name.includes('01-sqlite-to-postgres'));
      
      if (sqliteMigration) {
        console.log('⚠️ Encontrada la migración de SQLite a PostgreSQL:', sqliteMigration.name);
        console.log('Eliminando para permitir que se ejecute nuevamente...');
        
        await client.query(`
          DELETE FROM strapi_migrations 
          WHERE name LIKE '%01-sqlite-to-postgres%'
        `);
        console.log('✅ Migración eliminada correctamente');
      } else {
        console.log('✅ No se encontró la migración de SQLite a PostgreSQL. Está lista para ejecutarse.');
      }
    } else {
      console.log('⚠️ La tabla strapi_migrations no existe. Esto es normal si es la primera ejecución.');
    }
    
    // PASO 5: Verificar y reiniciar secuencias
    console.log('\nPASO 5: Verificando secuencias de las tablas...');
    
    // Obtener todas las secuencias
    const sequences = await client.query(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
    `);
    
    if (sequences.rows.length > 0) {
      console.log(`Encontradas ${sequences.rows.length} secuencias:`);
      
      for (const seq of sequences.rows) {
        try {
          // Reiniciar la secuencia
          await client.query(`ALTER SEQUENCE ${seq.sequence_name} RESTART WITH 1;`);
          console.log(`✅ Secuencia ${seq.sequence_name} reiniciada`);
        } catch (seqError) {
          console.warn(`⚠️ No se pudo reiniciar la secuencia ${seq.sequence_name}: ${seqError.message}`);
        }
      }
    } else {
      console.log('No se encontraron secuencias.');
    }
    
    console.log('\n=== SOLUCIÓN COMPLETADA ===');
    console.log('\nAhora puedes intentar ejecutar Strapi nuevamente con:');
    console.log('npm run develop');
    
  } catch (error) {
    console.error('Error durante el proceso de solución:', error);
  } finally {
    if (client) client.release();
    if (pool) await pool.end();
  }
}

// Ejecutar la solución
fixMigrationTransactions();