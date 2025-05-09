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
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        created_by_id INTEGER,
        updated_by_id INTEGER,
        locale VARCHAR(255),
        document_id VARCHAR(255),
        published_at TIMESTAMP WITH TIME ZONE
      )
    `);

    // 2. Crear categoría por defecto si no existe
    console.log('\n=== Creando categoría por defecto ===');
    await pgPool.query(`
      INSERT INTO categories (
        title, description, created_at, updated_at, created_by_id, 
        updated_by_id, url, locale, document_id, published_at
      )
      SELECT 
        'Sin Categoría', 
        'Categoría por defecto para productos sin categoría',
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        1,
        1,
        'sin-categoria',
        'en',
        'default_category',
        CURRENT_TIMESTAMP
      WHERE NOT EXISTS (SELECT 1 FROM categories WHERE title = 'Sin Categoría')
    `);

    // 3. Obtener ID de la categoría por defecto
    const defaultCategory = await pgPool.query(`
      SELECT id FROM categories WHERE title = 'Sin Categoría'
    `);
    const defaultCategoryId = defaultCategory.rows[0]?.id || 1;

    // 4. Asignar categoría por defecto al producto
    console.log('\n=== Asignando categoría por defecto ===');
    await pgPool.query(`
      INSERT INTO products_categories (
        product_id, category_id, created_at, updated_at, created_by_id,
        updated_by_id, locale, document_id, published_at
      )
      SELECT 
        p.id,
        $1,
        CURRENT_TIMESTAMP,
        CURRENT_TIMESTAMP,
        1,
        1,
        'en',
        'default_product_category',
        CURRENT_TIMESTAMP
      FROM products p
      WHERE NOT EXISTS (
        SELECT 1 FROM products_categories pc
        WHERE pc.product_id = p.id
      )
    `, [defaultCategoryId]);

    // 5. Corregir precio del producto
    console.log('\n=== Corrigiendo precio del producto ===');
    await pgPool.query(`
      UPDATE products
      SET price = 645.03
      WHERE id = 625
    `);

    // 6. Agregar descripción adecuada
    console.log('\n=== Agregando descripción adecuada ===');
    await pgPool.query(`
      UPDATE products
      SET description = 'Multímetro de alta precisión para reparación de dispositivos móviles. Incluye accesorios para reparación y mantenimiento de teléfonos móviles.'
      WHERE id = 625
    `);

    // 7. Verificar y crear marca si no existe
    console.log('\n=== Verificando y creando marca ===');
    const brandCheck = await pgPool.query(`
      SELECT id FROM brands WHERE name = 'dalaar'
    `);

    if (brandCheck.rows.length === 0) {
      await pgPool.query(`
        INSERT INTO brands (
          name, slug, created_at, updated_at, created_by_id,
          updated_by_id, locale, document_id, published_at
        )
        VALUES (
          'dalaar',
          'dalaar',
          CURRENT_TIMESTAMP,
          CURRENT_TIMESTAMP,
          1,
          1,
          'en',
          'dalaar_brand',
          CURRENT_TIMESTAMP
        )
      `);
    }

    console.log('\n=== Problemas corregidos ===');
    pgPool.end();
  } catch (error) {
    console.error('Error al corregir problemas de productos:', error);
  }
}

fixProductIssues();
