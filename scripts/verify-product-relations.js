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
    console.log('\n=== Verificando productos y categorías ===');
    const products = await pgPool.query(`
      SELECT 
        p.id as product_id, 
        p.name as product_name,
        p.category_id,
        c.id as category_id,
        c.name as category_name
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
    `);

    console.log(`\nEncontrados ${products.rows.length} productos:`);
    products.rows.forEach(product => {
      console.log(`\nProducto ID: ${product.product_id}`);
      console.log(`- Nombre: ${product.product_name}`);
      console.log(`- Categoría ID: ${product.category_id}`);
      console.log(`- Categoría: ${product.category_name || 'SIN CATEGORÍA'}`);
    });

    // 2. Verificar productos y sus marcas
    console.log('\n=== Verificando productos y marcas ===');
    const productsBrands = await pgPool.query(`
      SELECT 
        p.id as product_id, 
        p.name as product_name,
        p.brand_id,
        b.id as brand_id,
        b.name as brand_name
      FROM products p
      LEFT JOIN brands b ON p.brand_id = b.id
    `);

    console.log(`\nEncontrados ${productsBrands.rows.length} productos con marcas:`);
    productsBrands.rows.forEach(product => {
      console.log(`\nProducto ID: ${product.product_id}`);
      console.log(`- Nombre: ${product.product_name}`);
      console.log(`- Marca ID: ${product.brand_id}`);
      console.log(`- Marca: ${product.brand_name || 'SIN MARCA'}`);
    });

    // 3. Verificar productos y sus colores
    console.log('\n=== Verificando productos y colores ===');
    const productColors = await pgPool.query(`
      SELECT 
        p.id as product_id, 
        p.name as product_name,
        c.id as color_id,
        c.name as color_name
      FROM products p
      JOIN products_colors pc ON p.id = pc.product_id
      JOIN colors c ON pc.color_id = c.id
    `);

    console.log(`\nEncontradas ${productColors.rows.length} relaciones producto-color:`);
    productColors.rows.forEach(pc => {
      console.log(`\nProducto ID: ${pc.product_id}`);
      console.log(`- Nombre: ${pc.product_name}`);
      console.log(`- Color ID: ${pc.color_id}`);
      console.log(`- Color: ${pc.color_name}`);
    });

    // 4. Verificar productos y sus tallas
    console.log('\n=== Verificando productos y tallas ===');
    const productSizes = await pgPool.query(`
      SELECT 
        p.id as product_id, 
        p.name as product_name,
        s.id as size_id,
        s.name as size_name
      FROM products p
      JOIN products_sizes ps ON p.id = ps.product_id
      JOIN sizes s ON ps.size_id = s.id
    `);

    console.log(`\nEncontradas ${productSizes.rows.length} relaciones producto-talla:`);
    productSizes.rows.forEach(ps => {
      console.log(`\nProducto ID: ${ps.product_id}`);
      console.log(`- Nombre: ${ps.product_name}`);
      console.log(`- Talla ID: ${ps.size_id}`);
      console.log(`- Talla: ${ps.size_name}`);
    });

    // 5. Verificar productos sin imágenes
    console.log('\n=== Verificando productos sin imágenes ===');
    const productsWithoutImages = await pgPool.query(`
      SELECT 
        p.id as product_id, 
        p.name as product_name
      FROM products p
      LEFT JOIN products_images pi ON p.id = pi.product_id
      WHERE pi.id IS NULL
    `);

    console.log(`\nEncontrados ${productsWithoutImages.rows.length} productos sin imágenes:`);
    productsWithoutImages.rows.forEach(product => {
      console.log(`\nProducto ID: ${product.product_id}`);
      console.log(`- Nombre: ${product.product_name}`);
    });

    // 6. Verificar productos sin descripción
    console.log('\n=== Verificando productos sin descripción ===');
    const productsWithoutDescription = await pgPool.query(`
      SELECT 
        id as product_id, 
        name as product_name,
        description
      FROM products 
      WHERE description IS NULL OR description = ''
    `);

    console.log(`\nEncontrados ${productsWithoutDescription.rows.length} productos sin descripción:`);
    productsWithoutDescription.rows.forEach(product => {
      console.log(`\nProducto ID: ${product.product_id}`);
      console.log(`- Nombre: ${product.product_name}`);
    });

    pgPool.end();
  } catch (error) {
    console.error('Error al verificar relaciones de productos:', error);
  }
}

verifyProductRelations();
