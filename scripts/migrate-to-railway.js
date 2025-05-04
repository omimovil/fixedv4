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

    // Verificar si estamos en Railway
    const isRailway = process.env.DATABASE_URL && process.env.DATABASE_URL.length > 0;

    if (!isRailway) {
      console.error('Error: No se encontró la variable DATABASE_URL de Railway');
      process.exit(1);
    }

    // Conectar a PostgreSQL usando la DATABASE_URL de Railway
    const pgConfig = {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      }
    };

    const pgClient = new Client(pgConfig);
    try {
      await pgClient.connect();
      console.log('Conexión a PostgreSQL establecida exitosamente');
    } catch (error) {
      console.error('Error conectando a PostgreSQL:', error);
      process.exit(1);
    }

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
  console.log('=== INICIANDO MIGRACIÓN DE DATOS ===');
  console.log('Iniciando migración en orden específico...');

  // Mostrar información de la base de datos
  console.log('\nInformación de la base de datos:');
  try {
    const sqliteDb = new sqlite3.Database(SQLITE_DB_PATH);
    const sqliteTables = await new Promise((resolve, reject) => {
      sqliteDb.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, tables) => {
        if (err) reject(err);
        resolve(tables.map(t => t.name));
      });
    });
    console.log('Tablas en SQLite:', sqliteTables);
  } catch (error) {
    console.error('Error al listar tablas:', error);
  }

  // Migrar tablas en orden específico
  for (const tableName of MIGRATION_ORDER) {
    console.log(`\nMigrando tabla: ${tableName}`);
    try {
      // Verificar si la tabla existe
      const sqliteDb = new sqlite3.Database(SQLITE_DB_PATH);
      const tableExists = await new Promise((resolve, reject) => {
        sqliteDb.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
          if (err) reject(err);
          resolve(!!row);
        });
      });
      
      if (!tableExists) {
        console.error(`Tabla ${tableName} no existe en SQLite`);
        continue;
      }

      await migrateTable(tableName);
      console.log(`Tabla ${tableName} migrada exitosamente`);
    } catch (error) {
      console.error(`Error migrando ${tableName}:`, error);
      continue; // Continuar con la siguiente tabla aunque haya error
    }
  }

  // Migrar tablas restantes
  const remainingTables = TABLES.filter(table => !MIGRATION_ORDER.includes(table));
  for (const tableName of remainingTables) {
    console.log(`\nMigrando tabla: ${tableName}`);
    try {
      await migrateTable(tableName);
      console.log(`Tabla ${tableName} migrada exitosamente`);
    } catch (error) {
      console.error(`Error migrando ${tableName}:`, error);
      continue;
    }
  }

  console.log('\nMigración completada');
}

// Ejecutar la migración
migrateInOrder();
