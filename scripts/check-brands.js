const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function checkBrands() {
  try {
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Verificando marcas ===');
    
    // Verificar marcas existentes
    const brands = await pgPool.query(`
      SELECT 
        id, name, slug, created_at, updated_at
      FROM brands
      ORDER BY id
    `);

    console.log(`\nEncontradas ${brands.rows.length} marcas:`);
    brands.rows.forEach(brand => {
      console.log(`\nMarca ID: ${brand.id}`);
      console.log(`- Nombre: ${brand.name}`);
      console.log(`- Slug: ${brand.slug}`);
      console.log(`- Creada: ${brand.created_at}`);
      console.log(`- Actualizada: ${brand.updated_at}`);
    });

    // Verificar si la marca 'dalaar' existe
    const dalaarBrand = await pgPool.query(`
      SELECT id FROM brands WHERE name = 'dalaar'
    `);

    if (dalaarBrand.rows.length > 0) {
      console.log('\nLa marca dalaar ya existe con ID:', dalaarBrand.rows[0].id);
    } else {
      console.log('\nLa marca dalaar no existe en la base de datos');
    }

    pgPool.end();
  } catch (error) {
    console.error('Error al verificar marcas:', error);
  }
}

checkBrands();
