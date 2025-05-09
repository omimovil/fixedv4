const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function fixProductIssues() {
  try {
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Corrigiendo Problemas de Productos ===');

    // 1. Crear tabla de relación productos_categorias si no existe
    console.log('\n=== Creando tabla productos_categorias ===');
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS products_categories (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        category_id INTEGER REFERENCES categories(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Crear categoría por defecto si no existe
    console.log('\n=== Creando categoría por defecto ===');
    const defaultCategory = await pgPool.query(`
      INSERT INTO categories (title, description, url)
      SELECT 'Sin Categoría', 'Categoría por defecto para productos sin categoría', 'sin-categoria'
      WHERE NOT EXISTS (SELECT 1 FROM categories WHERE title = 'Sin Categoría')
      RETURNING id
    `);

    const defaultCategoryId = defaultCategory.rows[0]?.id || 1;

    // 3. Asignar categoría por defecto al producto
    console.log('\n=== Asignando categoría por defecto ===');
    await pgPool.query(`
      INSERT INTO products_categories (product_id, category_id)
      SELECT p.id, $1
      FROM products p
      WHERE NOT EXISTS (
        SELECT 1 FROM products_categories pc
        WHERE pc.product_id = p.id
      )
    `, [defaultCategoryId]);

    // 4. Corregir precio del producto
    console.log('\n=== Corrigiendo precio del producto ===');
    await pgPool.query(`
      UPDATE products
      SET price = 645.03
      WHERE id = 625
    `);

    // 5. Agregar descripción adecuada
    console.log('\n=== Agregando descripción adecuada ===');
    await pgPool.query(`
      UPDATE products
      SET description = 'Multímetro de alta precisión para reparación de dispositivos móviles. Incluye accesorios para reparación y mantenimiento de teléfonos móviles.'
      WHERE id = 625
    `);

    // 6. Verificar y crear marca si no existe
    console.log('\n=== Verificando y creando marca ===');
    const brandCheck = await pgPool.query(`
      SELECT id FROM brands WHERE name = 'dalaar'
    `);

    if (brandCheck.rows.length === 0) {
      await pgPool.query(`
        INSERT INTO brands (name, slug)
        VALUES ('dalaar', 'dalaar')
      `);
    }

    console.log('\n=== Problemas corregidos ===');
    pgPool.end();
  } catch (error) {
    console.error('Error al corregir problemas de productos:', error);
  }
}

fixProductIssues();
