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

async function migrateShoppingCartsLinks() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Migrando Relaciones de Carritos ===');
    
    // 1. Crear tabla shopping_carts_author_id_lnk
    console.log('\n=== Creando tabla shopping_carts_author_id_lnk ===');
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS shopping_carts_author_id_lnk (
        id SERIAL PRIMARY KEY,
        shopping_cart_id INTEGER REFERENCES shopping_carts(id),
        user_id INTEGER REFERENCES strapi_users(id)
      )
    `);
    
    // 2. Migrar datos de shopping_carts_author_id_lnk
    console.log('\n=== Migrando datos de shopping_carts_author_id_lnk ===');
    const links = await new Promise((resolve, reject) => {
      sqliteDb.all('SELECT * FROM shopping_carts_author_id_lnk ORDER BY id', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    const linkClient = await pgPool.connect();
    try {
      for (const link of links) {
        await linkClient.query(`
          INSERT INTO shopping_carts_author_id_lnk (
            id, shopping_cart_id, user_id
          ) VALUES ($1, $2, $3)
        `, [
          link.id,
          link.shopping_cart_id,
          link.user_id
        ]);
        console.log(`Migrada relación carrito-usuario ID: ${link.id}`);
      }
    } finally {
      linkClient.release();
    }
    
    sqliteDb.close();
    pgPool.end();
    
    console.log('\n=== Migración de relaciones completada ===');
  } catch (error) {
    console.error('Error en la migración:', error);
  }
}

migrateShoppingCartsLinks();
