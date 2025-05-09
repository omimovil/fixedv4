const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

// Función mejorada para manejar timestamps
function convertTimestamp(timestamp) {
  if (timestamp === null) return null;
  
  // Si es un timestamp Unix (segundos)
  if (typeof timestamp === 'number') {
    const date = new Date(timestamp * 1000);
    // Verificar si la fecha es válida
    if (isNaN(date.getTime())) {
      console.warn(`Timestamp inválido: ${timestamp}, usando fecha actual`);
      return new Date().toISOString();
    }
    return date.toISOString();
  }
  
  // Si ya es una fecha válida
  const date = new Date(timestamp);
  if (isNaN(date.getTime())) {
    console.warn(`Fecha inválida: ${timestamp}, usando fecha actual`);
    return new Date().toISOString();
  }
  return date.toISOString();
}

// Función para manejar tipos de datos específicos
function handleSpecialTypes(value, columnType) {
  if (value === null) return null;
  
  if (columnType === 'json' || columnType === 'jsonb') {
    try {
      if (typeof value === 'object') return JSON.stringify(value);
      return value;
    } catch (error) {
      console.warn(`Error convirtiendo JSON: ${error.message}, usando null`);
      return null;
    }
  }
  
  if (columnType === 'boolean') {
    return Boolean(value);
  }
  
  if (columnType === 'integer' || columnType === 'bigint') {
    try {
      return parseInt(value);
    } catch (error) {
      console.warn(`Error convirtiendo a número: ${error.message}, usando 0`);
      return 0;
    }
  }
  
  return value;
}

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function finalMigration() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Migración Final ===');
    
    // 1. Tablas de Usuarios y Roles
    const userRoleTables = [
      'strapi_users',
      'strapi_roles',
      'admin_users',
      'admin_users_roles',
      'up_users',
      'up_roles',
      'up_users_role'
    ];
    
    for (const table of userRoleTables) {
      await migrateTable(table, sqliteDb, pgPool);
    }
    
    // 2. Tablas de Contenido Principal
    const contentTables = [
      'brands',
      'categories',
      'colors',
      'delivery_dates',
      'orders',
      'payment_methods',
      'products',
      'shipping_states',
      'sizes',
      'available_categories',
      'personal_addresses',
      'addresses',
      'purchases',
      'ratings',
      'reviews',
      'shopping_carts',
      'shippings'
    ];
    
    for (const table of contentTables) {
      await migrateTable(table, sqliteDb, pgPool);
    }
    
    // 3. Tablas de Relaciones existentes
    const relationTables = [
      'products_sub_categories',
      'products_colors',
      'products_sizes',
      'products_brands',
      'products_delivery_dates',
      'products_payment_methods',
      'products_shipping_states'
    ];
    
    for (const table of relationTables) {
      await migrateTable(table, sqliteDb, pgPool);
    }
    
    // Función auxiliar para migrar una tabla
    async function migrateTable(tableName, sqliteDb, pgPool) {
      try {
        // Verificar si la tabla existe en SQLite
        const tableExists = await new Promise((resolve, reject) => {
          sqliteDb.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=$1`, [tableName], (err, row) => {
            if (err) reject(err);
            resolve(!!row);
          });
        });
        
        if (!tableExists) {
          console.log(`La tabla ${tableName} no existe en SQLite, saltando...`);
          return;
        }
        
        // Obtener datos de SQLite
        const rows = await new Promise((resolve, reject) => {
          sqliteDb.all(`SELECT * FROM ${tableName} ORDER BY id`, (err, rows) => {
            if (err) reject(err);
            resolve(rows);
          });
        });
        
        if (rows.length > 0) {
          const client = await pgPool.connect();
          try {
            // Obtener información de columnas de PostgreSQL
            const columns = await client.query(`
              SELECT column_name, data_type 
              FROM information_schema.columns 
              WHERE table_name = $1 
              ORDER BY ordinal_position
            `, [tableName]);
            
            const columnNames = columns.rows.map(row => row.column_name);
            const columnTypes = columns.rows.reduce((acc, row) => {
              acc[row.column_name] = row.data_type;
              return acc;
            }, {});
            
            // Insertar datos
            for (const row of rows) {
              const values = columnNames.map(col => {
                const value = row[col];
                // Convertir timestamps si es necesario
                if (col.endsWith('_at') && value !== null) {
                  return convertTimestamp(value);
                }
                // Manejar tipos de datos específicos
                return handleSpecialTypes(value, columnTypes[col]);
              });
              
              const placeholders = Array(values.length).fill(0).map((_, i) => `$${i + 1}`).join(', ');
              
              try {
                await client.query(`
                  INSERT INTO ${tableName} (${columnNames.join(', ')}) 
                  VALUES (${placeholders})
                `, values);
              } catch (error) {
                console.error(`Error insertando registro en ${tableName}:`, error);
                // Intentar continuar con el siguiente registro
                continue;
              }
            }
            
            console.log(`Migrados ${rows.length} registros de ${tableName}`);
          } finally {
            client.release();
          }
        } else {
          console.log(`No hay datos para migrar en ${tableName}`);
        }
      } catch (error) {
        console.error(`Error al migrar ${tableName}:`, error);
      }
    }
    
    // 4. Verificar integridad
    console.log('\n=== Verificando integridad ===');
    const client = await pgPool.connect();
    try {
      // Verificar referencias a usuarios
      const tablesToCheck = [
        ...contentTables,
        ...relationTables
      ];
      
      for (const table of tablesToCheck) {
        try {
          const result = await client.query(`
            SELECT COUNT(*) as count 
            FROM ${table} 
            WHERE created_by_id IS NOT NULL 
            AND NOT EXISTS (
              SELECT 1 FROM strapi_users WHERE id = ${table}.created_by_id
            )
          `);
          
          if (result.rows[0].count > 0) {
            console.warn(`¡Advertencia! Hay ${result.rows[0].count} registros en ${table} con referencias inválidas`);
          }
        } catch (error) {
          console.error(`Error verificando integridad en ${table}:`, error);
          continue;
        }
      }
      
      // Verificar referencias a roles
      for (const table of tablesToCheck) {
        try {
          const result = await client.query(`
            SELECT COUNT(*) as count 
            FROM ${table} 
            WHERE role IS NOT NULL 
            AND NOT EXISTS (
              SELECT 1 FROM strapi_roles WHERE id = ${table}.role
            )
          `);
          
          if (result.rows[0].count > 0) {
            console.warn(`¡Advertencia! Hay ${result.rows[0].count} registros en ${table} con referencias inválidas a roles`);
          }
        } catch (error) {
          console.error(`Error verificando referencias a roles en ${table}:`, error);
          continue;
        }
      }
    } finally {
      client.release();
    }
    
    sqliteDb.close();
    pgPool.end();
    
    console.log('\nMigración completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
  }
}

finalMigration();
