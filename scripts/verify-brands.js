const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function verifyBrands() {
  try {
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Verificando Marcas ===');
    
    // Obtener todas las marcas con sus creadores
    const brands = await pgPool.query(`
      SELECT 
        b.id as brand_id,
        b.name as brand_name,
        b.created_by_id,
        u.username as creator_username,
        u.email as creator_email
      FROM brands b
      LEFT JOIN strapi_users u ON b.created_by_id = u.id
      ORDER BY b.id
    `);
    
    console.log(`\nEncontradas ${brands.rows.length} marcas:`);
    brands.rows.forEach(brand => {
      console.log(`\nMarca ID: ${brand.brand_id}`);
      console.log(`- Nombre: ${brand.brand_name}`);
      console.log(`- Creado por: ${brand.creator_username} (ID: ${brand.created_by_id})`);
      console.log(`- Email del creador: ${brand.creator_email}`);
    });
    
    // Verificar referencias problemáticas
    console.log('\n=== Verificando referencias problemáticas en marcas ===');
    const invalidBrands = await pgPool.query(`
      SELECT COUNT(*) as count
      FROM brands
      WHERE created_by_id NOT IN (
        SELECT id FROM strapi_users
      )
    `);
    
    console.log(`\nNúmero de marcas con referencias inválidas: ${invalidBrands.rows[0].count}`);
    
    pgPool.end();
  } catch (error) {
    console.error('Error al verificar marcas:', error);
  }
}

verifyBrands();
