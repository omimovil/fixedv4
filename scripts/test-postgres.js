const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function testConnection() {
  try {
    const pool = new Pool(pgConfig);
    const client = await pool.connect();
    
    console.log('Conectando a PostgreSQL...');
    
    // Verificar si la base de datos existe
    const dbExists = await client.query('SELECT 1');
    console.log('Base de datos accesible');
    
    // Verificar tablas existentes
    const tables = await client.query('SELECT table_name FROM information_schema.tables WHERE table_schema = $1', ['public']);
    console.log('\nTablas existentes en la base de datos:');
    tables.rows.forEach(row => {
      console.log(`- ${row.table_name}`);
    });
    
    client.release();
    pool.end();
    
    console.log('\nConexión exitosa a PostgreSQL');
  } catch (error) {
    console.error('Error al conectar a PostgreSQL:', error);
  }
}

testConnection();
