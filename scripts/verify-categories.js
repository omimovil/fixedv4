const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function verifyCategories() {
  try {
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Verificando Categorías ===');
    const categories = await pgPool.query(`
      SELECT 
        id, title, description, url, created_at, updated_at
      FROM categories
      ORDER BY id
    `);

    console.log(`\nEncontradas ${categories.rows.length} categorías:`);
    categories.rows.forEach(category => {
      console.log(`\nCategoría ID: ${category.id}`);
      console.log(`- Título: ${category.title}`);
      console.log(`- Descripción: ${category.description}`);
      console.log(`- URL: ${category.url}`);
      console.log(`- Creada: ${category.created_at}`);
      console.log(`- Actualizada: ${category.updated_at}`);
    });

    pgPool.end();
  } catch (error) {
    console.error('Error al verificar categorías:', error);
  }
}

verifyCategories();
