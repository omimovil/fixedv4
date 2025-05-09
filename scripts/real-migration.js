const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

// Función para convertir timestamps de SQLite a PostgreSQL
function convertTimestamp(timestamp) {
  if (timestamp === null) return null;
  if (typeof timestamp === 'number') {
    // Si es un timestamp Unix (segundos)
    return new Date(timestamp * 1000).toISOString();
  }
  // Si ya es una fecha válida
  return new Date(timestamp).toISOString();
}

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function realMigration() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Migración Real ===');
    
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
      console.log(`\n=== Migrando ${table} ===`);
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
      console.log(`\n=== Migrando ${table} ===`);
      await migrateTable(table, sqliteDb, pgPool);
    }
    
    // 3. Tablas de Relaciones
    const relationTables = [
      'available_categories_products',
      'brands_products',
      'colors_products',
      'delivery_dates_products',
      'orders_products',
      'payment_methods_products',
      'shipping_states_products',
      'shopping_carts_products',
      'sizes_products',
      'categories_products'
    ];
    
    for (const table of relationTables) {
      console.log(`\n=== Migrando ${table} ===`);
      await migrateTable(table, sqliteDb, pgPool);
    }
    
    // 4. Tablas de Configuración
    const configTables = [
      'strapi_api_tokens',
      'strapi_api_token_permissions',
      'strapi_release_actions',
      'strapi_releases',
      'strapi_transfer_tokens',
      'strapi_transfer_token_permissions',
      'strapi_workflows',
      'strapi_workflows_stages',
      'strapi_workflows_stages_permissions'
    ];
    
    for (const table of configTables) {
      console.log(`\n=== Migrando ${table} ===`);
      await migrateTable(table, sqliteDb, pgPool);
    }
    
    // 5. Tablas de Permisos
    const permissionTables = [
      'up_permissions',
      'up_permissions_role'
    ];
    
    for (const table of permissionTables) {
      console.log(`\n=== Migrando ${table} ===`);
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
            // Obtener columnas de la tabla
            const columns = await client.query(`
              SELECT column_name 
              FROM information_schema.columns 
              WHERE table_name = $1 
              ORDER BY ordinal_position
            `, [tableName]);
            
            const columnNames = columns.rows.map(row => row.column_name);
            
            // Insertar datos
            for (const row of rows) {
              const values = columnNames.map(col => {
                const value = row[col];
                // Convertir timestamps si es necesario
                if (col.endsWith('_at') && value !== null) {
                  return convertTimestamp(value);
                }
                // Convertir JSON si es necesario
                if (typeof value === 'object' && value !== null) {
                  return JSON.stringify(value);
                }
                return value;
              });
              
              const placeholders = Array(values.length).fill(0).map((_, i) => `$${i + 1}`).join(', ');
              
              await client.query(`
                INSERT INTO ${tableName} (${columnNames.join(', ')}) 
                VALUES (${placeholders})
              `, values);
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
    
    // 6. Verificar integridad
    console.log('\n=== Verificando integridad ===');
    const client = await pgPool.connect();
    try {
      // Verificar referencias a usuarios
      const tablesToCheck = [
        ...contentTables,
        ...relationTables
      ];
      
      for (const table of tablesToCheck) {
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
      }
      
      // Verificar referencias a roles
      for (const table of tablesToCheck) {
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

realMigration();
