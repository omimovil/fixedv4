const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Configuración de PostgreSQL
const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

// Tablas en orden de dependencia
const migrationOrder = [
  'strapi_roles',
  'strapi_users',
  'strapi_webhooks',
  'strapi_files',
  'strapi_file_morph',
  'address',
  'available_categories',
  'brands',
  'categories',
  'colors',
  'contact_addresses',
  'cookies',
  'cookie_categories',
  'cookie_popups',
  'customers',
  'countries',
  'delivery_dates',
  'favorite_products',
  'orders',
  'payment_methods',
  'payments',
  'personal_addresses',
  'product_in_cart',
  'products',
  'purchases',
  'ratings',
  'reviews',
  'shipping',
  'shipping_states',
  'shopping_carts',
  'sizes'
];

// Tipos de datos específicos para cada tabla
const columnTypes = {
  available_categories: {
    category_id: 'INTEGER',
    created_by_id: 'INTEGER',
    updated_by_id: 'INTEGER',
    document_id: 'INTEGER'
  },
  strapi_users: {
    role: 'INTEGER'
  }
};

async function migrateTable(tableName) {
  const sqliteDb = new sqlite3.Database('.tmp/data.db');
  const pgClient = new Pool(pgConfig);

  try {
    console.log(`\nMigrando tabla: ${tableName}`);

    // Obtener estructura de la tabla
    const columns = await new Promise((resolve, reject) => {
      sqliteDb.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
        if (err) reject(err);
        resolve(rows.map(row => row.name));
      });
    });

    // Obtener datos de SQLite
    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(`SELECT * FROM ${tableName}`, (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    if (rows.length === 0) {
      console.log(`No se encontraron datos en la tabla ${tableName}`);
      return;
    }

    console.log(`Encontrados ${rows.length} registros`);

    const client = await pgClient.connect();
    
    try {
      // Obtener el ID del usuario administrador para las referencias
      let adminUserId = null;
      if (tableName === 'available_categories') {
        const adminResult = await client.query(`
          SELECT id FROM strapi_users WHERE email = 'admin@example.com' LIMIT 1
        `);
        adminUserId = adminResult.rows[0]?.id;
      }

      for (const row of rows) {
        // Preparar valores para PostgreSQL
        const values = columns.map(col => {
          const value = row[col];
          
          // Manejar tipos de datos específicos
          if (columnTypes[tableName] && columnTypes[tableName][col]) {
            if (value && !isNaN(value)) {
              return parseInt(value, 10);
            }
            return null;
          }
          
          // Manejar campos de fecha
          if (col.endsWith('_at')) {
            if (value && !isNaN(value)) {
              return new Date(parseInt(value)).toISOString();
            }
            return null;
          }
          
          // Para las columnas de usuario, usar el ID del administrador si es necesario
          if (col === 'created_by_id' || col === 'updated_by_id') {
            return adminUserId || value;
          }
          
          return value;
        });

        // Construir la consulta de inserción
        const placeholders = Array(values.length).fill(0).map((_, i) => `$${i + 1}`).join(', ');
        const query = `INSERT INTO ${tableName} (${columns.join(', ')}) VALUES (${placeholders})`;
        
        await client.query(query, values);
        console.log(`Migrado registro de ${tableName}`);
      }
      
      console.log(`Migrados ${rows.length} registros de ${tableName} en total`);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error(`Error migrando tabla ${tableName}:`, error);
  } finally {
    sqliteDb.close();
    pgClient.end();
  }
}

async function migrateAllData() {
  try {
    for (const tableName of migrationOrder) {
      await migrateTable(tableName);
    }
    console.log('\nMigración completada exitosamente');
  } catch (error) {
    console.error('Error durante la migración:', error);
  }
}

migrateAllData();
