const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function fixProductCategory() {
  try {
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Asignando categoría correcta al producto ===');

    // Asignar categoría Phone repair tools al producto
    await pgPool.query(`
      INSERT INTO products_categories (
        product_id, category_id, created_at, updated_at
      )
      VALUES (
        625, -- ID del producto
        37, -- ID de la categoría Phone repair tools
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (product_id, category_id) DO NOTHING
    `);

    // Verificar asignación
    const result = await pgPool.query(`
      SELECT 
        p.id as product_id,
        p.title as product_name,
        c.id as category_id,
        c.title as category_name
      FROM products p
      JOIN products_categories pc ON p.id = pc.product_id
      JOIN categories c ON pc.category_id = c.id
      WHERE p.id = 625
    `);

    if (result.rows.length > 0) {
      console.log('\nProducto asignado correctamente:');
      console.log(`- ID: ${result.rows[0].product_id}`);
      console.log(`- Nombre: ${result.rows[0].product_name}`);
      console.log(`- Categoría ID: ${result.rows[0].category_id}`);
      console.log(`- Categoría: ${result.rows[0].category_name}`);
    } else {
      console.log('\nNo se pudo asignar la categoría al producto');
    }

    pgPool.end();
  } catch (error) {
    console.error('Error al asignar categoría al producto:', error);
  }
}

fixProductCategory();
