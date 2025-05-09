const sqlite3 = require('sqlite3').verbose();
const { Pool } = require('pg');
const path = require('path');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function migrateShoppingAndSizes() {
  try {
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Migrando Carritos y Tallas ===');
    
    // 1. Verificar si la tabla sizes ya existe y tiene datos
    console.log('\n=== Verificando tabla sizes ===');
    const sizeCount = await pgPool.query('SELECT COUNT(*) as count FROM sizes');
    
    if (sizeCount.rows[0].count === 0) {
      console.log('\n=== Tabla sizes vacía, migrando datos ===');
      const sizes = await new Promise((resolve, reject) => {
        sqliteDb.all('SELECT * FROM sizes ORDER BY id', (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
      
      const pgClient = await pgPool.connect();
      try {
        for (const size of sizes) {
          await pgClient.query(`
            INSERT INTO sizes (
              id, created_at, updated_at, published_at,
              created_by_id, updated_by_id, label, available,
              quantity, document_id, locale
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
          `, [
            size.id,
            convertTimestamp(size.created_at),
            convertTimestamp(size.updated_at),
            convertTimestamp(size.published_at),
            size.created_by_id,
            size.updated_by_id,
            size.label,
            size.available,
            size.quantity,
            size.document_id,
            size.locale
          ]);
          console.log(`Migrada talla ${size.label} (ID: ${size.id})`);
        }
      } finally {
        pgClient.release();
      }
    } else {
      console.log('\n=== Tabla sizes ya tiene datos ===');
    }
    
    // 3. Verificar si la tabla shopping_carts ya existe y tiene datos
    console.log('\n=== Verificando tabla shopping_carts ===');
    const cartCount = await pgPool.query('SELECT COUNT(*) as count FROM shopping_carts');
    
    if (cartCount.rows[0].count === 0) {
      console.log('\n=== Tabla shopping_carts vacía, creando tabla ===');
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS shopping_carts (
          id SERIAL PRIMARY KEY,
          uploaded_at TIMESTAMP WITH TIME ZONE,
          active BOOLEAN,
          cart_id VARCHAR(255),
          created_at TIMESTAMP WITH TIME ZONE,
          updated_at TIMESTAMP WITH TIME ZONE,
          created_by_id INTEGER REFERENCES strapi_users(id),
          updated_by_id INTEGER REFERENCES strapi_users(id),
          quantity INTEGER,
          subtotal DECIMAL(10,2),
          availability BOOLEAN,
          brand VARCHAR(255),
          discount DECIMAL(10,2),
          product_id VARCHAR(255),
          size_id INTEGER REFERENCES sizes(id),
          color_id INTEGER,
          color_name VARCHAR(255),
          price DECIMAL(10,2),
          title VARCHAR(255),
          document_id VARCHAR(255),
          locale VARCHAR(255),
          published_at TIMESTAMP WITH TIME ZONE,
          customer_id INTEGER REFERENCES strapi_users(id),
          sku VARCHAR(255),
          color_hex VARCHAR(255),
          size_name VARCHAR(255),
          available_stock INTEGER,
          vendor VARCHAR(255),
          sub_total DECIMAL(10,2),
          total_items INTEGER,
          currency VARCHAR(255),
          applied_coupon VARCHAR(255),
          discount_amount DECIMAL(10,2),
          shipping_cost DECIMAL(10,2),
          estimated_taxes DECIMAL(10,2),
          last_updated TIMESTAMP WITH TIME ZONE,
          image_url VARCHAR(255)
        )
      `);
    } else {
      console.log('\n=== Tabla shopping_carts ya tiene datos ===');
    }
    
    // 4. Verificar si la tabla shopping_carts_author_id_lnk ya existe y tiene datos
    console.log('\n=== Verificando tabla shopping_carts_author_id_lnk ===');
    const linkCount = await pgPool.query('SELECT COUNT(*) as count FROM shopping_carts_author_id_lnk');
    
    if (linkCount.rows[0].count === 0) {
      console.log('\n=== Tabla shopping_carts_author_id_lnk vacía, creando tabla ===');
      await pgPool.query(`
        CREATE TABLE IF NOT EXISTS shopping_carts_author_id_lnk (
          id SERIAL PRIMARY KEY,
          shopping_cart_id INTEGER REFERENCES shopping_carts(id),
          user_id INTEGER REFERENCES strapi_users(id)
        )
      `);
    } else {
      console.log('\n=== Tabla shopping_carts_author_id_lnk ya tiene datos ===');
    }
    
    // 5. Migrar datos de shopping_carts si la tabla está vacía
    if (cartCount.rows[0].count === 0) {
      console.log('\n=== Migrando datos de shopping_carts ===');
      const carts = await new Promise((resolve, reject) => {
        sqliteDb.all('SELECT * FROM shopping_carts ORDER BY id', (err, rows) => {
          if (err) reject(err);
          resolve(rows);
        });
      });
      
      const cartClient = await pgPool.connect();
      try {
        for (const cart of carts) {
          await cartClient.query(`
            INSERT INTO shopping_carts (
              id, uploaded_at, active, cart_id, created_at, updated_at,
              created_by_id, updated_by_id, quantity, subtotal, availability,
              brand, discount, product_id, size_id, color_id, color_name,
              price, title, document_id, locale, published_at, customer_id,
              sku, color_hex, size_name, available_stock, vendor, sub_total,
              total_items, currency, applied_coupon, discount_amount,
              shipping_cost, estimated_taxes, last_updated, image_url
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22, $23, $24, $25, $26, $27, $28, $29, $30, $31, $32, $33, $34, $35, $36, $37)
          `, [
            cart.id,
            convertTimestamp(cart.uploaded_at),
            cart.active,
            cart.cart_id,
            convertTimestamp(cart.created_at),
            convertTimestamp(cart.updated_at),
            cart.created_by_id,
            cart.updated_by_id,
            cart.quantity,
            cart.subtotal,
            cart.availability,
            cart.brand,
            cart.discount,
            cart.product_id,
            cart.size_id,
            cart.color_id,
            cart.color_name,
            cart.price,
            cart.title,
            cart.document_id,
            cart.locale,
            convertTimestamp(cart.published_at),
            cart.costumer_id,
            cart.sku,
            cart.color_hex,
            cart.size_name,
            cart.available_stock,
            cart.vendor,
            cart.sub_total,
            cart.total_items,
            cart.currency,
            cart.applied_coupon,
            cart.discount_amount,
            cart.shipping_cost,
            cart.estimated_taxes,
            convertTimestamp(cart.last_updated),
            cart.image_url
          ]);
          console.log(`Migrado carrito ID: ${cart.id}`);
        }
      } finally {
        cartClient.release();
      }
    } else {
      console.log('\n=== Tabla shopping_carts ya tiene datos, no se migrarán ===');
    }
    
    // 6. Migrar datos de shopping_carts_author_id_lnk si la tabla está vacía
    if (linkCount.rows[0].count === 0) {
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
    } else {
      console.log('\n=== Tabla shopping_carts_author_id_lnk ya tiene datos, no se migrarán ===');
    }
    
    sqliteDb.close();
    pgPool.end();
    
    console.log('\n=== Migración completada exitosamente ===');
  } catch (error) {
    console.error('Error en la migración:', error);
  }
}

// Función para convertir timestamps
function convertTimestamp(timestamp) {
  if (timestamp === null) return null;
  if (typeof timestamp === 'number') {
    return new Date(timestamp).toISOString();
  }
  return new Date(timestamp).toISOString();
}

migrateShoppingAndSizes();
