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

    console.log('\n=== Verificando Integridad de Productos ===');

    // 1. Verificar productos con sus datos básicos
    console.log('\n=== Verificando productos básicos ===');
    const products = await pgPool.query(`
      SELECT 
        id as product_id,
        title as product_name,
        description,
        price,
        stock,
        brand,
        created_at,
        updated_at
      FROM products
      ORDER BY id
    `);

    console.log(`\nEncontrados ${products.rows.length} productos:`);
    products.rows.forEach(product => {
      console.log(`\nProducto ID: ${product.product_id}`);
      console.log(`- Nombre: ${product.product_name}`);
      console.log(`- Descripción: ${product.description || 'SIN DESCRIPCIÓN'}`);
      console.log(`- Precio: ${product.price || 'SIN PRECIO'}`);
      console.log(`- Stock: ${product.stock || 'SIN STOCK'}`);
      console.log(`- Marca: ${product.brand || 'SIN MARCA'}`);
      console.log(`- Creado: ${product.created_at}`);
      console.log(`- Actualizado: ${product.updated_at}`);
    });

    // 2. Verificar productos sin descripción
    console.log('\n=== Verificando productos sin descripción ===');
    const productsWithoutDescription = await pgPool.query(`
      SELECT 
        id as product_id,
        title as product_name
      FROM products
      WHERE description IS NULL OR description = ''
    `);

    console.log(`\nEncontrados ${productsWithoutDescription.rows.length} productos sin descripción:`);
    productsWithoutDescription.rows.forEach(product => {
      console.log(`\nProducto ID: ${product.product_id}`);
      console.log(`- Nombre: ${product.product_name}`);
    });

    // 3. Verificar productos sin precio
    console.log('\n=== Verificando productos sin precio ===');
    const productsWithoutPrice = await pgPool.query(`
      SELECT 
        id as product_id,
        title as product_name,
        price
      FROM products
      WHERE price IS NULL OR price <= 0
    `);

    console.log(`\nEncontrados ${productsWithoutPrice.rows.length} productos sin precio:`);
    productsWithoutPrice.rows.forEach(product => {
      console.log(`\nProducto ID: ${product.product_id}`);
      console.log(`- Nombre: ${product.product_name}`);
      console.log(`- Precio: ${product.price}`);
    });

    // 4. Verificar productos sin stock
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

    // 5. Verificar productos sin marca
    console.log('\n=== Verificando productos sin marca ===');
    const productsWithoutBrand = await pgPool.query(`
      SELECT 
        id as product_id,
        title as product_name,
        brand
      FROM products
      WHERE brand IS NULL OR brand = ''
    `);

    console.log(`\nEncontrados ${productsWithoutBrand.rows.length} productos sin marca:`);
    productsWithoutBrand.rows.forEach(product => {
      console.log(`\nProducto ID: ${product.product_id}`);
      console.log(`- Nombre: ${product.product_name}`);
      console.log(`- Marca: ${product.brand}`);
    });

    // 6. Verificar productos sin categorías
    console.log('\n=== Verificando productos sin categorías ===');
    const productsWithoutCategories = await pgPool.query(`
      SELECT 
        p.id as product_id,
        p.title as product_name
      FROM products p
      WHERE NOT EXISTS (
        SELECT 1 FROM categories c
        WHERE c.id IN (
          SELECT category_id FROM products_categories pc
          WHERE pc.product_id = p.id
        )
      )
    `);

    console.log(`\nEncontrados ${productsWithoutCategories.rows.length} productos sin categorías:`);
    productsWithoutCategories.rows.forEach(product => {
      console.log(`\nProducto ID: ${product.product_id}`);
      console.log(`- Nombre: ${product.product_name}`);
    });

    pgPool.end();
  } catch (error) {
    console.error('Error al verificar relaciones de productos:', error);
  }
}

verifyProductRelations();
