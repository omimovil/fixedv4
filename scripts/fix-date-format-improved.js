/**
 * Script mejorado para solucionar problemas de formato de fecha en PostgreSQL
 * 
 * Este script aborda específicamente el error:
 * "time zone displacement out of range: "+057323-12-28T16:59:21.000Z"
 * que ocurre durante la migración de SQLite a PostgreSQL
 */

const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Configuración de conexión a PostgreSQL
const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

// Ruta a la base de datos SQLite
const sqliteDbPath = '.tmp/data.db';

// Función para validar y corregir fechas
function safeDate(dateValue) {
  if (dateValue === null || dateValue === undefined) {
    return null;
  }
  
  try {
    // Si es un string numérico, podría ser un timestamp
    if (typeof dateValue === 'string' && /^\d+$/.test(dateValue)) {
      const numVal = parseInt(dateValue, 10);
      
      // Si el valor es demasiado grande para PostgreSQL, usar fecha actual
      if (numVal > 2147483647000) { 
        console.log(`  Valor de timestamp demasiado grande: ${numVal}. Usando fecha actual.`);
        return new Date().toISOString();
      }
      
      // Ajustar según la longitud (segundos vs milisegundos)
      const timestamp = dateValue.length <= 10 ? numVal * 1000 : numVal;
      const date = new Date(timestamp);
      
      // Verificar si es una fecha válida
      if (isNaN(date.getTime())) {
        console.log(`  Fecha inválida para valor: ${dateValue}. Usando NULL.`);
        return null;
      }
      
      return date.toISOString();
    } else if (dateValue instanceof Date) {
      return dateValue.toISOString();
    } else if (typeof dateValue === 'string') {
      // Verificar si la fecha es válida
      const date = new Date(dateValue);
      if (isNaN(date.getTime()) || dateValue.includes('+057323')) {
        console.log(`  Fecha inválida o fuera de rango: ${dateValue}. Usando fecha actual.`);
        return new Date().toISOString();
      }
      return date.toISOString();
    }
    
    // Para otros casos, usar NULL
    return null;
  } catch (error) {
    console.log(`  Error procesando fecha '${dateValue}': ${error.message}. Usando NULL.`);
    return null;
  }
}

async function fixDateFormatImproved() {
  let sqliteDb = null;
  let pgPool = null;
  let client = null;
  
  try {
    console.log('Conectando a PostgreSQL...');
    pgPool = new Pool(pgConfig);
    client = await pgPool.connect();
    
    // 1. Limpiar transacciones abortadas
    console.log('\n=== Limpiando transacciones abortadas ===');
    try {
      await client.query('ROLLBACK');
      console.log('Transacciones abortadas limpiadas correctamente.');
    } catch (error) {
      console.log('No hay transacciones abortadas para limpiar:', error.message);
    }
    
    // 2. Configurar el estilo de fecha en PostgreSQL
    console.log('\n=== Configurando estilo de fecha en PostgreSQL ===');
    await client.query("SET datestyle = 'ISO, MDY';");
    const result = await client.query('SHOW datestyle;');
    console.log(`Estilo de fecha actual: ${result.rows[0].datestyle}`);
    
    // 3. Verificar si la base de datos SQLite existe
    if (!fs.existsSync(sqliteDbPath)) {
      console.error(`Error: Base de datos SQLite no encontrada en ${sqliteDbPath}`);
      console.log('No se pueden corregir los datos sin la base de datos SQLite.');
      return;
    }
    
    // 4. Conectar a SQLite
    console.log('\n=== Conectando a SQLite ===');
    sqliteDb = new sqlite3.Database(sqliteDbPath);
    
    // 5. Corregir fechas en available_categories
    console.log('\n=== Corrigiendo fechas en available_categories ===');
    const availableCategories = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM available_categories', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    if (availableCategories.length > 0) {
      console.log(`Encontrados ${availableCategories.length} registros en available_categories`);
      
      // Limpiar tabla en PostgreSQL
      try {
        await client.query('DELETE FROM available_categories');
        console.log('Tabla available_categories limpiada en PostgreSQL');
      } catch (error) {
        console.warn(`No se pudo limpiar la tabla available_categories: ${error.message}`);
      }
      
      // Insertar con fechas corregidas
      for (const category of availableCategories) {
        const correctedCategory = { ...category };
        
        // Corregir campos de fecha
        if (correctedCategory.created_at) {
          correctedCategory.created_at = safeDate(correctedCategory.created_at);
        }
        if (correctedCategory.updated_at) {
          correctedCategory.updated_at = safeDate(correctedCategory.updated_at);
        }
        if (correctedCategory.published_at) {
          correctedCategory.published_at = safeDate(correctedCategory.published_at);
        }
        
        // Construir consulta de inserción
        const columns = Object.keys(correctedCategory);
        const values = Object.values(correctedCategory);
        const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
        
        try {
          await client.query(
            `INSERT INTO available_categories (${columns.join(', ')}) VALUES (${placeholders})`,
            values
          );
          console.log(`  Registro ID ${correctedCategory.id} migrado correctamente`);
        } catch (error) {
          console.error(`  Error al migrar registro ID ${correctedCategory.id}:`, error.message);
        }
      }
    } else {
      console.log('La tabla available_categories está vacía, no hay datos para corregir.');
    }
    
    // 6. Reiniciar las migraciones de Strapi
    console.log('\n=== Verificando tabla de migraciones ===');
    const tableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'strapi_migrations'
      );
    `);
    
    if (tableExists.rows[0].exists) {
      console.log('Tabla de migraciones encontrada. Eliminando registros...');
      
      // Obtener lista de migraciones actuales para referencia
      const currentMigrations = await client.query('SELECT * FROM strapi_migrations ORDER BY id');
      console.log('\nMigraciones actuales:');
      currentMigrations.rows.forEach(migration => {
        console.log(`- ${migration.name} (${migration.id})`);
      });
      
      // Eliminar todos los registros de la tabla de migraciones
      await client.query('DELETE FROM strapi_migrations');
      console.log('\nRegistros de migraciones eliminados correctamente.');
      
      // Reiniciar la secuencia de ID
      await client.query('ALTER SEQUENCE strapi_migrations_id_seq RESTART WITH 1');
      console.log('Secuencia de ID reiniciada.');
    } else {
      console.log('La tabla strapi_migrations no existe. No es necesario reiniciar.');
    }
    
    // 7. Verificar y limpiar la tabla strapi_migrations_internal si existe
    console.log('\n=== Verificando tabla de migraciones internas ===');
    const internalTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'strapi_migrations_internal'
      );
    `);
    
    if (internalTableExists.rows[0].exists) {
      console.log('Tabla de migraciones internas encontrada. Eliminando registros...');
      await client.query('DELETE FROM strapi_migrations_internal');
      console.log('Registros de migraciones internas eliminados correctamente.');
      
      // Reiniciar la secuencia de ID
      await client.query('ALTER SEQUENCE strapi_migrations_internal_id_seq RESTART WITH 1');
      console.log('Secuencia de ID reiniciada.');
    } else {
      console.log('La tabla strapi_migrations_internal no existe. No es necesario reiniciar.');
    }
    
    console.log('\n=== Proceso completado ===');
    console.log('La base de datos PostgreSQL ha sido preparada para un inicio limpio de Strapi.');
    console.log('Ahora puedes ejecutar: npm run develop');
    
  } catch (error) {
    console.error('Error al preparar la base de datos PostgreSQL:', error);
  } finally {
    // Cerrar conexiones
    if (client) client.release();
    if (pgPool) await pgPool.end();
    if (sqliteDb) sqliteDb.close();
  }
}

fixDateFormatImproved();