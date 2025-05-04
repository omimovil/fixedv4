const fs = require('fs');
const path = require('path');
const { Client } = require('pg');
const sqlite3 = require('sqlite3').verbose();

// Determinar si estamos en Railway
const IS_RAILWAY = process.env.RAILWAY === 'true';

// Intentar restaurar la base de datos desde el backup
const BACKUP_DB_PATH = path.join(__dirname, '../.tmp/data.db');
let dbPath = ':memory:'; // Usar variable en lugar de constante

// Intentar restaurar la base de datos desde el backup
try {
  if (fs.existsSync(BACKUP_DB_PATH)) {
    dbPath = BACKUP_DB_PATH;
    console.log('Base de datos restaurada desde backup');
  } else {
    console.log('No se encontró backup, creando base de datos en memoria');
  }
} catch (error) {
  console.error('Error al restaurar base de datos:', error);
}

// Crear la base de datos en memoria
const sqliteDb = new sqlite3.Database(':memory:');

// Crear las tablas necesarias
const createTables = [
  'CREATE TABLE strapi_users (id INTEGER PRIMARY KEY, username TEXT, email TEXT, provider TEXT, confirmed BOOLEAN, blocked BOOLEAN, role INTEGER, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE strapi_roles (id INTEGER PRIMARY KEY, name TEXT, description TEXT, type TEXT UNIQUE, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE strapi_webhooks (id INTEGER PRIMARY KEY, name TEXT, url TEXT, headers TEXT, events TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE strapi_files (id INTEGER PRIMARY KEY, name TEXT, alternativeText TEXT, caption TEXT, width INTEGER, height INTEGER, formats TEXT, hash TEXT, ext TEXT, mime TEXT, size REAL, url TEXT, provider TEXT, provider_metadata TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE strapi_file_morph (id INTEGER PRIMARY KEY, related_type TEXT, related_id INTEGER, field TEXT, strapi_file_id INTEGER, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE address (id INTEGER PRIMARY KEY, street TEXT, city TEXT, state TEXT, postalCode TEXT, country TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE available_categories (id INTEGER PRIMARY KEY, name TEXT, description TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE brands (id INTEGER PRIMARY KEY, name TEXT, description TEXT, logo TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT, description TEXT, parent_id INTEGER, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE colors (id INTEGER PRIMARY KEY, name TEXT, code TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE contact_addresses (id INTEGER PRIMARY KEY, name TEXT, email TEXT, phone TEXT, address TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE cookies (id INTEGER PRIMARY KEY, name TEXT, description TEXT, category_id INTEGER, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE cookie_categories (id INTEGER PRIMARY KEY, name TEXT, description TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE cookie_popups (id INTEGER PRIMARY KEY, title TEXT, description TEXT, accept_text TEXT, reject_text TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE customers (id INTEGER PRIMARY KEY, name TEXT, email TEXT, phone TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE countries (id INTEGER PRIMARY KEY, name TEXT, code TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE delivery_dates (id INTEGER PRIMARY KEY, date TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE favorite_products (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, total REAL, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE order_products (id INTEGER PRIMARY KEY, order_id INTEGER, product_id INTEGER, quantity INTEGER, price REAL, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE payments (id INTEGER PRIMARY KEY, order_id INTEGER, amount REAL, status TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE payment_methods (id INTEGER PRIMARY KEY, name TEXT, description TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE personal_addresses (id INTEGER PRIMARY KEY, customer_id INTEGER, street TEXT, city TEXT, state TEXT, postalCode TEXT, country TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, description TEXT, price REAL, stock INTEGER, category_id INTEGER, brand_id INTEGER, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE product_in_carts (id INTEGER PRIMARY KEY, product_id INTEGER, cart_id INTEGER, quantity INTEGER, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE purchases (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, quantity INTEGER, price REAL, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE ratings (id INTEGER PRIMARY KEY, product_id INTEGER, customer_id INTEGER, rating INTEGER, comment TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE reviews (id INTEGER PRIMARY KEY, product_id INTEGER, customer_id INTEGER, title TEXT, content TEXT, rating INTEGER, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE shippings (id INTEGER PRIMARY KEY, name TEXT, description TEXT, price REAL, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE shipping_states (id INTEGER PRIMARY KEY, name TEXT, description TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE shopping_carts (id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, created_at DATETIME, updated_at DATETIME)',
  'CREATE TABLE sizes (id INTEGER PRIMARY KEY, name TEXT, description TEXT, created_at DATETIME, updated_at DATETIME)'
];

// Ejecutar las sentencias de creación de tablas
createTables.forEach(sql => {
  sqliteDb.run(sql, (err) => {
    if (err) {
      console.error('Error creating table:', err);
    }
  });
});

// Configurar base de datos según el entorno
let db;

if (IS_RAILWAY) {
  // En Railway, usar una base de datos en memoria
  console.log('En Railway: usando base de datos en memoria');
  db = new sqlite3.Database(':memory:');
} else {
  // En local, usar la base de datos SQLite
  const SQLITE_DB_PATH = path.join(__dirname, '../.tmp/data.db');
  db = new sqlite3.Database(SQLITE_DB_PATH);
  console.log('En local: usando base de datos en:', SQLITE_DB_PATH);
}

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

// Función para verificar la conexión a la base de datos
async function verifyDatabase() {
  try {
    if (IS_RAILWAY) {
      // En Railway, crear las tablas necesarias en memoria
      console.log('Creando tablas en memoria...');
      const createTables = [
        'CREATE TABLE strapi_users (id INTEGER PRIMARY KEY, username TEXT, email TEXT, provider TEXT, confirmed BOOLEAN, blocked BOOLEAN, role INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE strapi_roles (id INTEGER PRIMARY KEY, name TEXT, description TEXT, type TEXT UNIQUE, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE strapi_webhooks (id INTEGER PRIMARY KEY, name TEXT, url TEXT, headers TEXT, events TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE strapi_files (id INTEGER PRIMARY KEY, name TEXT, alternativeText TEXT, caption TEXT, width INTEGER, height INTEGER, formats TEXT, hash TEXT, ext TEXT, mime TEXT, size REAL, url TEXT, provider TEXT, provider_metadata TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE strapi_file_morph (id INTEGER PRIMARY KEY, strapi_file_id INTEGER, related_id INTEGER, related_type TEXT, field TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE address (id INTEGER PRIMARY KEY, customer_id INTEGER, name TEXT, address TEXT, city TEXT, state TEXT, zip_code TEXT, country_id INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE available_categories (id INTEGER PRIMARY KEY, name TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE brands (id INTEGER PRIMARY KEY, name TEXT, description TEXT, logo TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT, description TEXT, parent_id INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE colors (id INTEGER PRIMARY KEY, name TEXT, code TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE contact_addresses (id INTEGER PRIMARY KEY, name TEXT, address TEXT, city TEXT, state TEXT, zip_code TEXT, country_id INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE cookies (id INTEGER PRIMARY KEY, name TEXT, description TEXT, expiration INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE cookie_categories (id INTEGER PRIMARY KEY, name TEXT, description TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE cookie_popups (id INTEGER PRIMARY KEY, title TEXT, description TEXT, accept_button_text TEXT, reject_button_text TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE customers (id INTEGER PRIMARY KEY, user_id INTEGER, first_name TEXT, last_name TEXT, email TEXT, phone TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE countries (id INTEGER PRIMARY KEY, name TEXT, code TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE delivery_dates (id INTEGER PRIMARY KEY, date DATE, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE favorite_products (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, total REAL, shipping_address_id INTEGER, billing_address_id INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE order_products (id INTEGER PRIMARY KEY, order_id INTEGER, product_id INTEGER, quantity INTEGER, price REAL, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE payments (id INTEGER PRIMARY KEY, order_id INTEGER, amount REAL, status TEXT, payment_method_id INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE payment_methods (id INTEGER PRIMARY KEY, name TEXT, description TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE personal_addresses (id INTEGER PRIMARY KEY, customer_id INTEGER, name TEXT, address TEXT, city TEXT, state TEXT, zip_code TEXT, country_id INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, description TEXT, price REAL, stock INTEGER, brand_id INTEGER, category_id INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE product_in_carts (id INTEGER PRIMARY KEY, product_id INTEGER, cart_id INTEGER, quantity INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE purchases (id INTEGER PRIMARY KEY, product_id INTEGER, customer_id INTEGER, quantity INTEGER, price REAL, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE ratings (id INTEGER PRIMARY KEY, product_id INTEGER, customer_id INTEGER, rating INTEGER, comment TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE reviews (id INTEGER PRIMARY KEY, product_id INTEGER, customer_id INTEGER, title TEXT, content TEXT, rating INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE shippings (id INTEGER PRIMARY KEY, order_id INTEGER, status TEXT, tracking_number TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE shipping_states (id INTEGER PRIMARY KEY, name TEXT, description TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE shopping_carts (id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE sizes (id INTEGER PRIMARY KEY, name TEXT, created_at DATETIME, updated_at DATETIME)'
      ];

      for (const sql of createTables) {
        await new Promise((resolve, reject) => {
          db.run(sql, (err) => {
            if (err) reject(err);
            resolve();
          });
        });
      }
      console.log('Tablas creadas en memoria exitosamente');
    } else {
      // En local, verificar la existencia de la base de datos
      console.log('Verificando base de datos en:', SQLITE_DB_PATH);
      if (!fs.existsSync(SQLITE_DB_PATH)) {
        console.error('Error: No se encontró la base de datos de Strapi en:', SQLITE_DB_PATH);
        process.exit(1);
      }
      console.log('Base de datos encontrada en:', SQLITE_DB_PATH);

      // Verificar tablas existentes
      const tables = await new Promise((resolve, reject) => {
        db.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, rows) => {
          if (err) reject(err);
          resolve(rows.map(row => row.name));
        });
      });

      if (tables.length === 0) {
        console.error('Error: La base de datos está vacía. Asegúrate de que Strapi esté ejecutando localmente.');
        process.exit(1);
      }

      console.log('Tablas encontradas en la base de datos:', tables);
    }
  } catch (error) {
    console.error('Error al verificar la base de datos:', error);
    process.exit(1);
  }
}

// Verificar si existe la base de datos de Strapi
async function verifyDatabase() {
  try {
    if (IS_RAILWAY) {
      // En Railway, crear las tablas necesarias en memoria
      console.log('Creando tablas en memoria...');
      const createTables = [
        'CREATE TABLE strapi_users (id INTEGER PRIMARY KEY, username TEXT, email TEXT, provider TEXT, confirmed BOOLEAN, blocked BOOLEAN, role INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE strapi_roles (id INTEGER PRIMARY KEY, name TEXT, description TEXT, type TEXT UNIQUE, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE strapi_webhooks (id INTEGER PRIMARY KEY, name TEXT, url TEXT, headers TEXT, events TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE strapi_files (id INTEGER PRIMARY KEY, name TEXT, alternativeText TEXT, caption TEXT, width INTEGER, height INTEGER, formats TEXT, hash TEXT, ext TEXT, mime TEXT, size REAL, url TEXT, provider TEXT, provider_metadata TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE strapi_file_morph (id INTEGER PRIMARY KEY, strapi_file_id INTEGER, related_id INTEGER, related_type TEXT, field TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE address (id INTEGER PRIMARY KEY, customer_id INTEGER, name TEXT, address TEXT, city TEXT, state TEXT, zip_code TEXT, country_id INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE available_categories (id INTEGER PRIMARY KEY, name TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE brands (id INTEGER PRIMARY KEY, name TEXT, description TEXT, logo TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE categories (id INTEGER PRIMARY KEY, name TEXT, description TEXT, parent_id INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE colors (id INTEGER PRIMARY KEY, name TEXT, code TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE contact_addresses (id INTEGER PRIMARY KEY, name TEXT, address TEXT, city TEXT, state TEXT, zip_code TEXT, country_id INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE cookies (id INTEGER PRIMARY KEY, name TEXT, description TEXT, expiration INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE cookie_categories (id INTEGER PRIMARY KEY, name TEXT, description TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE cookie_popups (id INTEGER PRIMARY KEY, title TEXT, description TEXT, accept_button_text TEXT, reject_button_text TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE customers (id INTEGER PRIMARY KEY, user_id INTEGER, first_name TEXT, last_name TEXT, email TEXT, phone TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE countries (id INTEGER PRIMARY KEY, name TEXT, code TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE delivery_dates (id INTEGER PRIMARY KEY, date DATE, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE favorite_products (id INTEGER PRIMARY KEY, customer_id INTEGER, product_id INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE orders (id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, total REAL, shipping_address_id INTEGER, billing_address_id INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE order_products (id INTEGER PRIMARY KEY, order_id INTEGER, product_id INTEGER, quantity INTEGER, price REAL, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE payments (id INTEGER PRIMARY KEY, order_id INTEGER, amount REAL, status TEXT, payment_method_id INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE payment_methods (id INTEGER PRIMARY KEY, name TEXT, description TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE personal_addresses (id INTEGER PRIMARY KEY, customer_id INTEGER, name TEXT, address TEXT, city TEXT, state TEXT, zip_code TEXT, country_id INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, description TEXT, price REAL, stock INTEGER, brand_id INTEGER, category_id INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE product_in_carts (id INTEGER PRIMARY KEY, product_id INTEGER, cart_id INTEGER, quantity INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE purchases (id INTEGER PRIMARY KEY, product_id INTEGER, customer_id INTEGER, quantity INTEGER, price REAL, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE ratings (id INTEGER PRIMARY KEY, product_id INTEGER, customer_id INTEGER, rating INTEGER, comment TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE reviews (id INTEGER PRIMARY KEY, product_id INTEGER, customer_id INTEGER, title TEXT, content TEXT, rating INTEGER, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE shippings (id INTEGER PRIMARY KEY, order_id INTEGER, status TEXT, tracking_number TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE shipping_states (id INTEGER PRIMARY KEY, name TEXT, description TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE shopping_carts (id INTEGER PRIMARY KEY, customer_id INTEGER, status TEXT, created_at DATETIME, updated_at DATETIME)',
        'CREATE TABLE sizes (id INTEGER PRIMARY KEY, name TEXT, created_at DATETIME, updated_at DATETIME)'
      ];

      for (const sql of createTables) {
        await new Promise((resolve, reject) => {
          db.run(sql, (err) => {
            if (err) reject(err);
            resolve();
          });
        });
      }
      console.log('Tablas creadas en memoria exitosamente');
    } else {
      // En local, verificar la existencia de la base de datos
      const tables = await new Promise((resolve, reject) => {
        db.all(`SELECT name FROM sqlite_master WHERE type='table'`, (err, rows) => {
          if (err) reject(err);
          resolve(rows.map(row => row.name));
        });
      });

      if (tables.length === 0) {
        console.error('Error: La base de datos está vacía. Asegúrate de que Strapi esté ejecutando localmente.');
        process.exit(1);
      }

      console.log('Tablas encontradas en la base de datos:', tables);
    }
  } catch (error) {
    console.error('Error al verificar la base de datos:', error);
    process.exit(1);
  }
}

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
    
    // Verificar si la tabla existe
    const tableExists = await new Promise((resolve, reject) => {
      db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
        if (err) reject(err);
        resolve(!!row);
      });
    });

    if (!tableExists) {
      console.error(`Tabla ${tableName} no existe en la base de datos de Strapi`);
      return;
    }

    // Obtener estructura de la tabla
    const columns = await new Promise((resolve, reject) => {
      db.all(`PRAGMA table_info(${tableName})`, (err, rows) => {
        if (err) reject(err);
        resolve(rows.map(row => row.name));
      });
    });

    // Obtener datos
    const rows = await new Promise((resolve, reject) => {
      db.all(`SELECT * FROM ${tableName}`, (err, data) => {
        if (err) {
          console.error(`Error obteniendo datos de ${tableName}:`, err);
          reject(err);
        }
        console.log(`Encontrados ${data.length} registros`);
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
      console.log(`Columnas: ${columnNames}`);
      
      // Preparar los valores para la inserción
      const values = rows.map(row => 
        columns.map(col => {
          const val = row[col];
          if (val === null) return 'NULL';
          if (typeof val === 'string') return `'${val.replace(/'/g, "''")}'`;
          return val;
        }).join(', ')
      );

      // Insertar en lotes de 100 registros
      const batchSize = 100;
      for (let i = 0; i < values.length; i += batchSize) {
        const batch = values.slice(i, i + batchSize);
        const insertQuery = `INSERT INTO ${tableName} (${columnNames}) VALUES ${batch.map(v => `(${v})`).join(', ')}`;
        
        try {
          await pgClient.query(insertQuery);
          console.log(`Migrados ${batch.length} registros (lote ${Math.floor(i/batchSize) + 1})`);
        } catch (error) {
          console.error(`Error al insertar lote en ${tableName}:`, error);
          console.error('Query fallida:', insertQuery);
          throw error;
        }
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

  try {
    // Verificar la base de datos al inicio
    await verifyDatabase();

    // Migrar tablas en orden específico
    for (const tableName of MIGRATION_ORDER) {
      console.log(`\nMigrando tabla: ${tableName}`);
      try {
        // Verificar si la tabla existe
        const tableExists = await new Promise((resolve, reject) => {
          db.get(`SELECT name FROM sqlite_master WHERE type='table' AND name=?`, [tableName], (err, row) => {
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
  } catch (error) {
    console.error('Error en la migración:', error);
    process.exit(1);
  }
}

// Ejecutar el proceso principal
async function main() {
  try {
    // Verificar la base de datos
    await verifyDatabase();

    // Ejecutar la migración
    await migrateInOrder();
  } catch (error) {
    console.error('Error en el proceso principal:', error);
    process.exit(1);
  }
}

// Ejecutar el proceso principal
main();
