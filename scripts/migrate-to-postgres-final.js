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

async function migrateToPostgres() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Migrando Datos a PostgreSQL ===');

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
          INSERT INTO payment_methods (
            id, name, content, created_at, updated_at, published_at,
            created_by_id, updated_by_id, locale, document_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9, $10
          )
        `, [
          method.id,
          method.name,
          method.content,
          new Date(method.created_at).toISOString(),
          new Date(method.updated_at).toISOString(),
          new Date(method.updated_at).toISOString(),
          1, // admin user
          1, // admin user
          'en',
          `payment_method_${method.id}`
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

    // Eliminar duplicados en PostgreSQL
    await pgPool.query(`DELETE FROM delivery_dates WHERE id IN (7, 8, 9)`);

    for (const date of deliveryDates) {
      try {
        await pgPool.query(`
          INSERT INTO delivery_dates (
            id, delivery_date_name, created_at, updated_at, published_at,
            created_by_id, updated_by_id, locale, document_id
          ) VALUES (
            $1, $2, $3, $4, $5, $6, $7, $8, $9
          )
        `, [
          date.id,
          date.delivery_date_name,
          new Date(date.created_at).toISOString(),
          new Date(date.updated_at).toISOString(),
          new Date(date.updated_at).toISOString(),
          1, // admin user
          1, // admin user
          'en',
          `delivery_date_${date.id}`
        ]);
        console.log(`Migrada fecha de entrega: ${date.delivery_date_name}`);
      } catch (error) {
        console.error(`Error al migrar fecha de entrega ${date.delivery_date_name}:`, error);
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
            id, total_price, order_status, price, quantity,
            created_at, updated_at, published_at,
            created_by_id, updated_by_id, locale,
            document_id, shipping_price, notes, options
          ) VALUES (
            $1, $2, $3, $4, $5,
            $6, $7, $8,
            $9, $10, $11,
            $12, $13, $14, $15
          )
        `, [
          order.id,
          order.total_price,
          order.order_status,
          order.price,
          order.quantity,
          new Date(order.created_at).toISOString(),
          new Date(order.updated_at).toISOString(),
          new Date(order.updated_at).toISOString(),
          1, // admin user
          1, // admin user
          'en',
          `order_${order.id}`,
          0, // shipping_price por defecto
          '', // notes por defecto
          '{}' // options por defecto
        ]);
        console.log(`Migrada orden: ${order.id}`);
      } catch (error) {
        console.error(`Error al migrar orden ${order.id}:`, error);
      }
    }

    console.log('\n=== Migración completada ===');

    sqliteDb.close();
    pgPool.end();
  } catch (error) {
    console.error('Error al migrar datos:', error);
  }
}

migrateToPostgres();
