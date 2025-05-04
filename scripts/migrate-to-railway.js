const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const sqlite3 = require('sqlite3').verbose();

const SQLITE_DB_PATH = path.join(__dirname, '../.tmp/data.db');

// Tablas a migrar
const TABLES = [
  'strapi_users',
  'strapi_roles',
  'strapi_permissions',
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
  'order_products',
  'payments',
  'payment_methods',
  'personal_addresses',
  'products',
  'product_in_carts',
  'purchases',
  'ratings',
  'reviews',
  'shippings',
  'shipping_states',
  'shopping_carts',
  'sizes'
];

// Orden de migración
const MIGRATION_ORDER = [
  'strapi_roles',
  'strapi_permissions',
  'strapi_users',
  'countries',
  'categories',
  'brands',
  'products',
  'customers',
  'orders',
  'shopping_carts'
];

async function migrateTable(tableName) {
  try {
    console.log(`\nMigrando tabla: ${tableName}`);
    
    // Conectar a SQLite
    const sqliteDb = new sqlite3.Database(SQLITE_DB_PATH);
    
    // Obtener estructura de la tabla
    const columns = await new Promise((resolve, reject) => {
      sqliteDb.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
        if (err) reject(err);
        resolve(rows.map(row => row.name));
      });
    });

    // Obtener datos
    const rows = await new Promise((resolve, reject) => {
      sqliteDb.all(`SELECT * FROM ${tableName}`, (err, data) => {
        if (err) reject(err);
        resolve(data);
      });
    });

    if (rows.length === 0) {
      console.log(`No se encontraron datos en la tabla ${tableName}`);
      return;
    }

    console.log(`Encontrados ${rows.length} registros`);

    // Conectar a PostgreSQL
    const pgClient = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    });
    await pgClient.connect();

    try {
      // Insertar datos
      const columnNames = columns.join(', ');
      const values = rows.map(row => 
        columns.map(col => row[col]).map(val => 
          typeof val === 'string' ? `'${val}'` : val
        ).join(', ')
      );

      // Insertar en lotes de 100 registros
      const batchSize = 100;
      for (let i = 0; i < values.length; i += batchSize) {
        const batch = values.slice(i, i + batchSize);
        const insertQuery = `INSERT INTO ${tableName} (${columnNames}) VALUES ${batch.map(v => `(${v})`).join(', ')}`;
        await pgClient.query(insertQuery);
        console.log(`Migrados ${batch.length} registros (lote ${Math.floor(i/batchSize) + 1})`);
      }

      console.log(`\nVerificando migración de ${tableName}...`);
      const { rows: [count] } = await pgClient.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`Verificación exitosa: ${count.count} registros`);
    } finally {
      await pgClient.end();
    }
  } catch (error) {
    console.error(`Error migrando ${tableName}:`, error);
    process.exit(1);
  }
}

async function migrateInOrder() {
  try {
    console.log('Iniciando migración en orden específico...');
    
    // Migrar tablas principales
    for (const table of MIGRATION_ORDER) {
      if (TABLES.includes(table)) {
        await migrateTable(table);
      }
    }

    // Migrar tablas restantes
    const remainingTables = TABLES.filter(table => !MIGRATION_ORDER.includes(table));
    for (const table of remainingTables) {
      await migrateTable(table);
    }

    console.log('\nMigración completada exitosamente!');
  } catch (error) {
    console.error('Error durante la migración:', error);
    process.exit(1);
  }
}

// Ejecutar la migración
migrateInOrder();
