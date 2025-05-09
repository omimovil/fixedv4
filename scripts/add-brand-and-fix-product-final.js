const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function addBrandAndFixProduct() {
  try {
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Agregando marca y corrigiendo producto ===');

    // 1. Primero eliminamos cualquier intento previo de crear la marca
    await pgPool.query(`
      DELETE FROM brands WHERE name = 'dalaar'
    `);

    // 2. Agregamos la marca con un ID específico
    await pgPool.query(`
      INSERT INTO brands (
        id, name, slug, created_at, updated_at, created_by_id,
        updated_by_id, locale, document_id, published_at
      )
      VALUES (
        18, -- ID específico para evitar conflictos
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

    // 3. Actualizamos el producto con la marca
    await pgPool.query(`
      UPDATE products
      SET brand = 'dalaar'
      WHERE id = 625
    `);

    // 4. Verificar y corregir descripción
    await pgPool.query(`
      UPDATE products
      SET description = 'Multímetro de alta precisión para reparación de dispositivos móviles. Incluye accesorios para reparación y mantenimiento de teléfonos móviles.'
      WHERE id = 625
    `);

    // 5. Verificar y corregir precio
    await pgPool.query(`
      UPDATE products
      SET price = 645.03
      WHERE id = 625
    `);

    // 6. Verificar y corregir stock
    await pgPool.query(`
      UPDATE products
      SET stock = 12
      WHERE id = 625
    `);

    // 7. Verificar y corregir tallas
    const sizes = await pgPool.query(`
      SELECT id FROM sizes WHERE label = 'One Size' AND available = true
    `);

    if (sizes.rows.length > 0) {
      await pgPool.query(`
        INSERT INTO products_sizes (
          product_id, size_id, created_at, updated_at
        )
        VALUES (
          625, $1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `, [sizes.rows[0].id]);
    }

    // 8. Verificar y corregir colores
    const color = await pgPool.query(`
      SELECT id FROM colors WHERE name = 'Black'
    `);

    if (color.rows.length > 0) {
      await pgPool.query(`
        INSERT INTO products_colors (
          product_id, color_id, created_at, updated_at
        )
        VALUES (
          625, $1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
        )
      `, [color.rows[0].id]);
    }

    // 9. Verificar y corregir imágenes
    const images = await pgPool.query(`
      SELECT 
        id, url, alternativetext, caption
      FROM upload_files
      WHERE url LIKE '%multimeter%' OR url LIKE '%repair%'
    `);

    if (images.rows.length > 0) {
      for (const image of images.rows) {
        await pgPool.query(`
          INSERT INTO strapi_file_morph (
            model_name, model_id, field, file, created_at, updated_at
          )
          VALUES (
            'products', 625, 'images', $1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
          )
        `, [image.id]);
      }
    }

    // 10. Verificación final
    console.log('\n=== Verificación final del producto ===');
    const finalCheck = await pgPool.query(`
      SELECT 
        p.*,
        c.title as category_name,
        b.name as brand_name,
        ARRAY(
          SELECT color_id 
          FROM products_colors 
          WHERE product_id = p.id
        ) as colors,
        ARRAY(
          SELECT size_id 
          FROM products_sizes 
          WHERE product_id = p.id
        ) as sizes,
        ARRAY(
          SELECT file 
          FROM strapi_file_morph 
          WHERE model_name = 'products' AND model_id = p.id
        ) as images
      FROM products p
      LEFT JOIN products_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN brands b ON p.brand = b.name
      WHERE p.id = 625
    `);

    if (finalCheck.rows.length > 0) {
      const prod = finalCheck.rows[0];
      console.log('\nProducto final:');
      console.log(`- ID: ${prod.id}`);
      console.log(`- Nombre: ${prod.title}`);
      console.log(`- Descripción: ${prod.description}`);
      console.log(`- Precio: ${prod.price}`);
      console.log(`- Stock: ${prod.stock}`);
      console.log(`- Categoría: ${prod.category_name || 'SIN CATEGORÍA'}`);
      console.log(`- Marca: ${prod.brand_name || 'SIN MARCA'}`);
      console.log(`- Colores: ${prod.colors?.length || 0} colores`);
      console.log(`- Tallas: ${prod.sizes?.length || 0} tallas`);
      console.log(`- Imágenes: ${prod.images?.length || 0} imágenes`);
    }

    pgPool.end();
  } catch (error) {
    console.error('Error al agregar marca y corregir producto:', error);
  }
}

addBrandAndFixProduct();
