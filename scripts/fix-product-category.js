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

    // 1. Crear tabla de relación productos_categorias si no existe
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS products_categories (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        category_id INTEGER REFERENCES categories(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by_id INTEGER,
        updated_by_id INTEGER,
        locale VARCHAR(255),
        document_id VARCHAR(255),
        published_at TIMESTAMP WITH TIME ZONE
      )
    `);

    // 2. Asignar categoría Phone repair tools al producto
    await pgPool.query(`
      INSERT INTO products_categories (
        product_id, category_id, created_at, updated_at, created_by_id,
        updated_by_id, locale, document_id, published_at
      )
      VALUES (
        625, -- ID del producto
        37, -- ID de la categoría Phone repair tools
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        1,
        1,
        'en',
        'product_category_625',
        CURRENT_TIMESTAMP
      )
      ON CONFLICT (product_id, category_id) DO NOTHING
    `);

    // 3. Verificar asignación
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
