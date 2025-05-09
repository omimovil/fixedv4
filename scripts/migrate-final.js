const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const TABLE_MAPPING = require('./table-mapping');

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

async function createTable(tableName) {
  const pgClient = new Pool(pgConfig);
  
  try {
    console.log(`\nCreando tabla: ${tableName}`);
    
    // Obtener estructura de la tabla en SQLite
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const columns = await new Promise((resolve, reject) => {
      sqliteDb.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
        if (err) reject(err);
        resolve(rows.map(row => row.name));
      });
    });

    // Construir la definición de la tabla
    const columnDefs = columns.map(col => {
      let type = 'TEXT'; // Tipo por defecto
      
      // Determinar tipo de datos basado en el nombre de la columna
      if (col === 'id') type = 'SERIAL PRIMARY KEY';
      else if (col.includes('_at')) type = 'TIMESTAMP';
      else if (col.includes('id')) type = 'INTEGER';
      else if (col.includes('boolean')) type = 'BOOLEAN';
      else if (col.includes('decimal')) type = 'DECIMAL';
      else if (col.includes('integer')) type = 'INTEGER';
      
      // Agregar referencias a tablas relacionadas
      if (col === 'role') type += ' REFERENCES strapi_roles(id)';
      if (col === 'created_by_id' || col === 'updated_by_id') type += ' REFERENCES strapi_users(id)';
      if (col === 'file') type += ' REFERENCES strapi_files(id)';
      
      return `${col} ${type}`;
    });

    // Agregar campos de auditoría
    const auditColumns = 'created_at TIMESTAMP NOT NULL, updated_at TIMESTAMP NOT NULL';
    
    // Crear la tabla
    const createQuery = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefs.join(', ')}, ${auditColumns})`;
    const client = await pgClient.connect();
    
    try {
      await client.query(createQuery);
      console.log(`Tabla ${tableName} creada exitosamente`);
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error(`Error creando tabla ${tableName}:`, error);
  } finally {
    pgClient.end();
  }
}

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

async function createAndMigrateAll() {
  try {
    // Primero crear todas las tablas
    for (const tableName of migrationOrder) {
      await createTable(tableName);
    }

    // Luego migrar los datos
    for (const tableName of migrationOrder) {
      await migrateTable(tableName);
    }
    
    console.log('\nProceso de creación y migración completado exitosamente');
  } catch (error) {
    console.error('Error durante el proceso:', error);
  }
}

createAndMigrateAll();
