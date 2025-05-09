const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function migrateMissingData() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Migrando Datos Faltantes ===');

    // 1. Migrar payment_methods
    console.log('\n=== Migrando payment_methods ===');
    const paymentMethods = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM payment_methods', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    for (const method of paymentMethods) {
      try {
        await pgPool.query(`
          INSERT INTO payment_methods (id, name, description, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          method.id,
          method.name,
          method.description,
          method.created_at,
          method.updated_at
        ]);
        console.log(`Migrado método de pago: ${method.name}`);
      } catch (error) {
        console.error(`Error al migrar método de pago ${method.name}:`, error);
      }
    }

    // 2. Migrar delivery_dates
    console.log('\n=== Migrando delivery_dates ===');
    const deliveryDates = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM delivery_dates', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    for (const date of deliveryDates) {
      try {
        await pgPool.query(`
          INSERT INTO delivery_dates (id, date, description, created_at, updated_at)
          VALUES ($1, $2, $3, $4, $5)
        `, [
          date.id,
          date.date,
          date.description,
          date.created_at,
          date.updated_at
        ]);
        console.log(`Migrada fecha de entrega: ${date.description}`);
      } catch (error) {
        console.error(`Error al migrar fecha de entrega ${date.description}:`, error);
      }
    }

    // 3. Migrar orders
    console.log('\n=== Migrando orders ===');
    const orders = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM orders', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    for (const order of orders) {
      try {
        await pgPool.query(`
          INSERT INTO orders (
            id, total, status, created_by_id, created_at, updated_at
          ) VALUES ($1, $2, $3, $4, $5, $6)
        `, [
          order.id,
          order.total,
          order.status,
          order.created_by_id,
          order.created_at,
          order.updated_at
        ]);
        console.log(`Migrada orden: ${order.id}`);
      } catch (error) {
        console.error(`Error al migrar orden ${order.id}:`, error);
      }
    }

    // 4. Verificar productos faltantes
    console.log('\n=== Verificando productos faltantes ===');
    const sqliteProducts = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM products', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    const pgProducts = await pgPool.query('SELECT id FROM products');
    const pgProductIds = new Set(pgProducts.rows.map(row => row.id));

    for (const product of sqliteProducts) {
      if (!pgProductIds.has(product.id)) {
        try {
          await pgPool.query(`
            INSERT INTO products (
              id, name, description, price, created_by_id, created_at, updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7)
          `, [
            product.id,
            product.name,
            product.description,
            product.price,
            product.created_by_id,
            product.created_at,
            product.updated_at
          ]);
          console.log(`Migrado producto: ${product.name}`);
        } catch (error) {
          console.error(`Error al migrar producto ${product.name}:`, error);
        }
      }
    }

    console.log('\n=== Migración de datos faltantes completada ===');

    sqliteDb.close();
    pgPool.end();
  } catch (error) {
    console.error('Error al migrar datos faltantes:', error);
  }
}

migrateMissingData();
