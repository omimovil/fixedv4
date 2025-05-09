const { Pool } = require('pg');
const sqlite3 = require('sqlite3').verbose();

async function checkDatabase() {
  try {
    // Verificar si existe el archivo SQLite
    const sqliteDb = new sqlite3.Database('.tmp/data.db');
    const sqliteExists = await new Promise((resolve) => {
      sqliteDb.get('SELECT 1', (err) => {
        resolve(!err);
      });
    });
    
    // Verificar si podemos conectar a PostgreSQL
    const pgConfig = {
      user: 'postgres',
      host: 'localhost',
      database: 'fixedv4',
      password: 'ominey',
      port: 5432,
      ssl: false
    };
    
    const pgPool = new Pool(pgConfig);
    const pgConnected = await pgPool.query('SELECT 1');
    
    console.log('\n=== Estado de las bases de datos ===');
    console.log(`\nSQLite disponible: ${sqliteExists}`);
    console.log(`PostgreSQL disponible: ${!!pgConnected}`);
    
    // Verificar qué tablas existen en PostgreSQL
    console.log('\n=== Tablas en PostgreSQL ===');
    const tables = await pgPool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    console.log(`\nEncontradas ${tables.rows.length} tablas:`);
    tables.rows.forEach(table => {
      console.log(`- ${table.table_name}`);
    });
    
    sqliteDb.close();
    pgPool.end();
  } catch (error) {
    console.error('Error:', error);
  }
}

checkDatabase();
