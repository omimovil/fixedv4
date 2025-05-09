const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function verifyAllProductRelations() {
  try {
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Verificando todas las relaciones del producto ===');

    // 1. Verificar producto y sus relaciones básicas
    const product = await pgPool.query(`
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
        ) as sizes
      FROM products p
      LEFT JOIN products_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
      LEFT JOIN brands b ON p.brand = b.name
      WHERE p.id = 625
    `);

    if (product.rows.length > 0) {
      const prod = product.rows[0];
      console.log('\nProducto:');
      console.log(`- ID: ${prod.id}`);
      console.log(`- Nombre: ${prod.title}`);
      console.log(`- Descripción: ${prod.description}`);
      console.log(`- Precio: ${prod.price}`);
      console.log(`- Stock: ${prod.stock}`);
      console.log(`- Categoría: ${prod.category_name || 'SIN CATEGORÍA'}`);
      console.log(`- Marca: ${prod.brand_name || 'SIN MARCA'}`);
      console.log(`- Colores: ${prod.colors?.length || 0} colores`);
      console.log(`- Tallas: ${prod.sizes?.length || 0} tallas`);

      // 2. Verificar imágenes
      const images = await pgPool.query(`
        SELECT 
          pi.url,
          pi.alternative_text,
          pi.caption
        FROM products_images pi
        WHERE pi.product_id = 625
      `);

      console.log(`\nImágenes (${images.rows.length}):`);
      images.rows.forEach((img, index) => {
        console.log(`\nImagen ${index + 1}:`);
        console.log(`- URL: ${img.url}`);
        console.log(`- Texto alternativo: ${img.alternative_text || 'SIN TEXTO'}`);
        console.log(`- Descripción: ${img.caption || 'SIN DESCRIPCIÓN'}`);
      });
    }

    pgPool.end();
  } catch (error) {
    console.error('Error al verificar relaciones del producto:', error);
  }
}

verifyAllProductRelations();
