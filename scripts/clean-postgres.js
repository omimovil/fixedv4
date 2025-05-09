const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function cleanPostgres() {
  try {
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Limpiando Tablas en PostgreSQL ===');

    // 1. Eliminar registros de orders
    console.log('\n=== Eliminando orders ===');
    await pgPool.query(`
      DELETE FROM orders
      WHERE id IN (1, 2, 3, 4, 5, 11, 12, 13, 14, 15)
    `);

    // 2. Eliminar registros de delivery_dates
    console.log('\n=== Eliminando delivery_dates ===');
    await pgPool.query(`
      DELETE FROM delivery_dates
      WHERE id IN (1, 2, 3, 7, 8, 9)
    `);

    // 3. Eliminar registros de payment_methods
    console.log('\n=== Eliminando payment_methods ===');
    await pgPool.query(`
      DELETE FROM payment_methods
      WHERE id IN (1, 2, 3, 7, 8, 9)
    `);

    console.log('\n=== Tablas limpiadas ===');
    pgPool.end();
  } catch (error) {
    console.error('Error al limpiar tablas:', error);
  }
}

cleanPostgres();
