const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function verifyUsersAndBrands() {
  try {
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Verificando Usuarios y Marcas ===');
    
    // 1. Verificar usuarios
    console.log('\n=== Usuarios ===');
    const users = await pgPool.query(`
      SELECT u.id, u.username, u.email, r.name as role_name 
      FROM strapi_users u
      LEFT JOIN strapi_roles r ON u.role = r.id
      ORDER BY u.id
    `);
    
    console.log(`\nEncontrados ${users.rows.length} usuarios:`);
    users.rows.forEach(user => {
      console.log(`\nUsuario ID: ${user.id}`);
      console.log(`- Username: ${user.username}`);
      console.log(`- Email: ${user.email}`);
      console.log(`- Rol: ${user.role_name}`);
    });
    
    // 2. Verificar marcas y sus creadores
    console.log('\n=== Marcas y sus Creadores ===');
    const brands = await pgPool.query(`
      SELECT b.id, b.name, b.created_by_id, u.username as creator_username 
      FROM brands b
      LEFT JOIN strapi_users u ON b.created_by_id = u.id
      ORDER BY b.id
    `);
    
    console.log(`\nEncontradas ${brands.rows.length} marcas:`);
    brands.rows.forEach(brand => {
      console.log(`\nMarca ID: ${brand.id}`);
      console.log(`- Nombre: ${brand.name}`);
      console.log(`- Creado por: ${brand.creator_username} (ID: ${brand.created_by_id})`);
    });
    
    // 3. Verificar cuántas marcas tiene cada usuario
    console.log('\n=== Cantidad de Marcas por Usuario ===');
    const brandsPerUser = await pgPool.query(`
      SELECT u.id, u.username, COUNT(b.id) as brand_count 
      FROM strapi_users u
      LEFT JOIN brands b ON u.id = b.created_by_id
      GROUP BY u.id, u.username
      ORDER BY brand_count DESC
    `);
    
    console.log(`\nUsuarios y sus marcas:`);
    brandsPerUser.rows.forEach(row => {
      console.log(`- Usuario: ${row.username} (ID: ${row.id})`);
      console.log(`  Total marcas: ${row.brand_count}`);
    });
    
    pgPool.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyUsersAndBrands();
