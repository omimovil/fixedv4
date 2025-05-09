const { Pool } = require('pg');

const pool = new Pool({
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
});

async function verifyData() {
  try {
    const client = await pool.connect();
    
    console.log('\nVerificando datos en available_categories:');
    const result = await client.query('SELECT * FROM available_categories ORDER BY id');
    console.log('Total registros:', result.rows.length);
    console.log('\nDatos:');
    result.rows.forEach(row => {
      console.log(`ID: ${row.id}, Name: ${row.name}, Created At: ${row.created_at}`);
    });
    
    console.log('\nVerificando usuario administrador:');
    const adminResult = await client.query('SELECT * FROM strapi_users WHERE email = $1', ['admin@example.com']);
    console.log('Total usuarios:', adminResult.rows.length);
    
    client.release();
  } catch (error) {
    console.error('Error al verificar datos:', error);
  }
}

verifyData();
