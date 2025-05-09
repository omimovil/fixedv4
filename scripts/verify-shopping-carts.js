const sqlite3 = require('sqlite3').verbose();

async function verifyShoppingCarts() {
  try {
    const db = new sqlite3.Database('.tmp/data.db');
    
    console.log('\n=== Verificando estructura de shopping_carts ===');
    
    // Obtener información de la columna costumer_id
    const columns = await new Promise((resolve, reject) => {
      db.all('PRAGMA table_info(shopping_carts)', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
    
    console.log('\nColumnas de shopping_carts:');
    columns.forEach(col => {
    });
    
    // Verificar referencias problemáticas en carritos
    console.log('\n=== Verificando referencias problemáticas en carritos ===');
    const invalidCarts = await pgPool.query(`
      SELECT COUNT(*) as count
      FROM shopping_carts
      WHERE created_by_id NOT IN (
        SELECT id FROM strapi_users
      )
    `);
    
    console.log(`\nNúmero de carritos con referencias inválidas: ${invalidCarts.rows[0].count}`);
    
    // Verificar referencias en shopping_carts_author_id_lnk
    console.log('\n=== Verificando referencias en shopping_carts_author_id_lnk ===');
    const invalidLinks = await pgPool.query(`
      SELECT COUNT(*) as count
      FROM shopping_carts_author_id_lnk
      WHERE user_id NOT IN (
        SELECT id FROM strapi_users
      )
    `);
    
    console.log(`\nNúmero de referencias inválidas en shopping_carts_author_id_lnk: ${invalidLinks.rows[0].count}`);
    
    pgPool.end();
  } catch (error) {
    console.error('Error al verificar carritos:', error);
  }
}

verifyShoppingCarts();
