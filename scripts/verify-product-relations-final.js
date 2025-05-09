const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function verifyProductRelations() {
  try {
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Verificando Integridad de Productos y Relaciones ===');

    // 1. Verificar productos y sus categorías
    console.log('\n=== Verificando productos y sus categorías ===');
    const products = await pgPool.query(`
      SELECT 
        p.id as product_id, 
        p.title as product_name,
        p.description,
        c.id as category_id,
        c.title as category_name
      FROM products p
      LEFT JOIN products_categories pc ON p.id = pc.product_id
      LEFT JOIN categories c ON pc.category_id = c.id
    `);

    console.log(`\nEncontrados ${products.rows.length} productos:`);
    products.rows.forEach(product => {
      console.log(`\nProducto ID: ${product.product_id}`);
      console.log(`- Nombre: ${product.product_name}`);
      console.log(`- Descripción: ${product.description || 'SIN DESCRIPCIÓN'}`);
      console.log(`- Categoría ID: ${product.category_id}`);
      console.log(`- Categoría: ${product.category_name || 'SIN CATEGORÍA'}`);
    });

    // 2. Verificar productos y sus marcas
    console.log('\n=== Verificando productos y marcas ===');
    const productsBrands = await pgPool.query(`
      SELECT 
        p.id as product_id, 
        p.title as product_name,
        p.brand,
        b.id as brand_id,
        b.name as brand_name
      FROM products p
      LEFT JOIN brands b ON p.brand = b.name
    `);

    console.log(`\nEncontrados ${productsBrands.rows.length} productos con marcas:`);
    productsBrands.rows.forEach(product => {
      console.log(`\nProducto ID: ${product.product_id}`);
      console.log(`- Nombre: ${product.product_name}`);
      console.log(`- Marca: ${product.brand || 'SIN MARCA'}`);
      console.log(`- Marca ID: ${product.brand_id}`);
    });

    // 3. Verificar productos sin imágenes
    console.log('\n=== Verificando productos sin imágenes ===');
    const productsWithoutImages = await pgPool.query(`
      SELECT 
        p.id as product_id, 
        p.title as product_name
      FROM products p
      LEFT JOIN products_images pi ON p.id = pi.product_id
      WHERE pi.id IS NULL
    `);

    console.log(`\nEncontrados ${productsWithoutImages.rows.length} productos sin imágenes:`);
    productsWithoutImages.rows.forEach(product => {
      console.log(`\nProducto ID: ${product.product_id}`);
      console.log(`- Nombre: ${product.product_name}`);
    });

    // 4. Verificar productos sin precios
    console.log('\n=== Verificando productos sin precios ===');
    const productsWithoutPrice = await pgPool.query(`
      SELECT 
        id as product_id, 
        title as product_name,
        price
      FROM products 
      WHERE price IS NULL OR price <= 0
    `);

    console.log(`\nEncontrados ${productsWithoutPrice.rows.length} productos sin precios válidos:`);
    productsWithoutPrice.rows.forEach(product => {
      console.log(`\nProducto ID: ${product.product_id}`);
      console.log(`- Nombre: ${product.product_name}`);
      console.log(`- Precio: ${product.price}`);
    });

    // 5. Verificar productos sin stock
    console.log('\n=== Verificando productos sin stock ===');
    const productsWithoutStock = await pgPool.query(`
      SELECT 
        id as product_id, 
        title as product_name,
        stock
      FROM products 
      WHERE stock IS NULL OR stock <= 0
    `);

    console.log(`\nEncontrados ${productsWithoutStock.rows.length} productos sin stock:`);
    productsWithoutStock.rows.forEach(product => {
      console.log(`\nProducto ID: ${product.product_id}`);
      console.log(`- Nombre: ${product.product_name}`);
      console.log(`- Stock: ${product.stock}`);
    });

    // 6. Verificar productos sin tallas disponibles
    console.log('\n=== Verificando productos sin tallas disponibles ===');
    const productsWithoutSizes = await pgPool.query(`
      SELECT 
        p.id as product_id, 
        p.title as product_name
      FROM products p
      LEFT JOIN products_sizes ps ON p.id = ps.product_id
      LEFT JOIN sizes s ON ps.size_id = s.id
      WHERE s.available IS NOT TRUE
      GROUP BY p.id, p.title
    `);

    console.log(`\nEncontrados ${productsWithoutSizes.rows.length} productos sin tallas disponibles:`);
    productsWithoutSizes.rows.forEach(product => {
      console.log(`\nProducto ID: ${product.product_id}`);
      console.log(`- Nombre: ${product.product_name}`);
    });

    pgPool.end();
  } catch (error) {
    console.error('Error al verificar relaciones de productos:', error);
  }
}

verifyProductRelations();
