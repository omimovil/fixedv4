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

async function fixMigratedData() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Corrigiendo Datos Migrados ===');

    // 1. Corregir payment_methods
    console.log('\n=== Corrigiendo payment_methods ===');
    const paymentMethods = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM payment_methods', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    for (const method of paymentMethods) {
      try {
        await pgPool.query(`
          UPDATE payment_methods 
          SET content = $1
          WHERE id = $2
        `, [
          method.description,
          method.id
        ]);
        console.log(`Corregido método de pago: ${method.name}`);
      } catch (error) {
        console.error(`Error al corregir método de pago ${method.name}:`, error);
      }
    }

    // 2. Corregir delivery_dates
    console.log('\n=== Corrigiendo delivery_dates ===');
    const deliveryDates = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM delivery_dates', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    // Primero eliminamos los duplicados
    await pgPool.query(`
      DELETE FROM delivery_dates 
      WHERE id IN (7, 8, 9)
    `);

    // Luego actualizamos los existentes
    for (const date of deliveryDates) {
      try {
        await pgPool.query(`
          UPDATE delivery_dates 
          SET delivery_date_name = $1
          WHERE id = $2
        `, [
          date.description,
          date.id
        ]);
        console.log(`Corregida fecha de entrega: ${date.id}`);
      } catch (error) {
        console.error(`Error al corregir fecha de entrega ${date.id}:`, error);
      }
    }

    // 3. Corregir orders
    console.log('\n=== Corrigiendo orders ===');
    const orders = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM orders', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    for (const order of orders) {
      try {
        await pgPool.query(`
          UPDATE orders 
          SET total_price = $1, order_status = $2
          WHERE id = $3
        `, [
          order.total,
          order.status,
          order.id
        ]);
        console.log(`Corregida orden: ${order.id}`);
      } catch (error) {
        console.error(`Error al corregir orden ${order.id}:`, error);
      }
    }

    console.log('\n=== Datos corregidos ===');

    sqliteDb.close();
    pgPool.end();
  } catch (error) {
    console.error('Error al corregir datos:', error);
  }
}

fixMigratedData();
