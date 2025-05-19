/**
 * Script completo para solucionar problemas de migración a PostgreSQL
 * 
 * Este script realiza las siguientes acciones:
 * 1. Limpia las transacciones abortadas en PostgreSQL
 * 2. Configura el formato de fecha correcto
 * 3. Corrige los problemas de tipo de datos en available_categories
 * 4. Reinicia las migraciones de Strapi
 * 5. Prepara la base de datos para un inicio limpio de Strapi
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

// Función para obtener la estructura de la tabla en PostgreSQL
async function getPostgresTableStructure(client, tableName) {
  const result = await client.query(`
    SELECT column_name, data_type, is_nullable
    FROM information_schema.columns
    WHERE table_name = $1
    ORDER BY ordinal_position
  `, [tableName]);
  
  return result.rows;
}

// Función para convertir valores según el tipo de columna en PostgreSQL
function convertValueForPostgres(value, dataType) {
  if (value === null || value === undefined) {
    return null;
  }
  
  // Convertir según el tipo de datos
  switch(dataType) {
    case 'integer':
    case 'bigint':
    case 'smallint':
      // Si es un string que parece un UUID o un ID no numérico, devolver null
      if (typeof value === 'string' && !/^\d+$/.test(value)) {
        console.log(`  Valor no numérico para columna de tipo ${dataType}: ${value}. Usando NULL.`);
        return null;
      }
      return typeof value === 'string' ? parseInt(value, 10) : value;
      
    case 'numeric':
    case 'decimal':
    case 'real':
    case 'double precision':
      return typeof value === 'string' ? parseFloat(value) : value;
      
    case 'boolean':
      if (typeof value === 'string') {
        return value.toLowerCase() === 'true' || value === '1';
      }
      return Boolean(value);
      
    case 'timestamp with time zone':
    case 'timestamp without time zone':
    case 'date':
      return safeDate(value);
      
    default:
      return value;
  }
}

async function fixPostgresMigrationComplete() {
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
    if (fs.existsSync(sqliteDbPath)) {
      console.log('\n=== Conectando a SQLite ===');
      sqliteDb = new sqlite3.Database(sqliteDbPath);
      
      // 4. Corregir datos en available_categories
      console.log('\n=== Corrigiendo datos en available_categories ===');
      
      // Obtener estructura de la tabla en PostgreSQL
      const tableStructure = await getPostgresTableStructure(client, 'available_categories');
      console.log('Estructura de la tabla available_categories en PostgreSQL:');
      tableStructure.forEach(col => {
        console.log(`  ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'NULL' : 'NOT NULL'})`);
      });
      
      // Crear un mapa de tipos de columnas para facilitar la conversión
      const columnTypes = {};
      tableStructure.forEach(col => {
        columnTypes[col.column_name] = col.data_type;
      });
      
      // Obtener datos de SQLite
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
          // Intentar hacer rollback y volver a intentar
          await client.query('ROLLBACK');
          await client.query('DELETE FROM available_categories');
          console.log('Tabla available_categories limpiada después de rollback');
        }
        
        // Insertar con valores convertidos correctamente
        for (const category of availableCategories) {
          // Convertir valores según los tipos de columna
          const values = [];
          const columns = [];
          let placeholderIndex = 1;
          const placeholders = [];
          
          for (const [key, value] of Object.entries(category)) {
            // Solo incluir columnas que existen en PostgreSQL
            if (columnTypes[key]) {
              columns.push(key);
              const convertedValue = convertValueForPostgres(value, columnTypes[key]);
              values.push(convertedValue);
              placeholders.push(`$${placeholderIndex++}`);
            }
          }
          
          // Construir consulta de inserción
          const insertQuery = `INSERT INTO available_categories (${columns.join(', ')}) VALUES (${placeholders.join(', ')})`;
          
          try {
            await client.query(insertQuery, values);
            console.log(`  Registro ID ${category.id} migrado correctamente`);
          } catch (error) {
            console.error(`  Error al migrar registro ID ${category.id}:`, error.message);
            console.log('  Detalles del registro:', JSON.stringify(category));
          }
        }
      } else {
        console.log('La tabla available_categories está vacía, no hay datos para corregir.');
      }
    } else {
      console.log(`Base de datos SQLite no encontrada en ${sqliteDbPath}. Omitiendo corrección de datos.`);
    }
    
    // 5. Reiniciar las migraciones de Strapi
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
    
    // 6. Verificar y limpiar la tabla strapi_migrations_internal si existe
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
    
    // 7. Verificar y limpiar la tabla strapi_database_schema si existe
    console.log('\n=== Verificando tabla de esquema de base de datos ===');
    const schemaTableExists = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'strapi_database_schema'
      );
    `);
    
    if (schemaTableExists.rows[0].exists) {
      console.log('Tabla de esquema de base de datos encontrada. Eliminando registros...');
      await client.query('DELETE FROM strapi_database_schema');
      console.log('Registros de esquema de base de datos eliminados correctamente.');
    } else {
      console.log('La tabla strapi_database_schema no existe. No es necesario reiniciar.');
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

fixPostgresMigrationComplete();