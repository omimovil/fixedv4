const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

const BASIC_TABLES = [
  'strapi_roles',
  'strapi_users',
  'strapi_webhooks',
  'strapi_files',
  'strapi_file_morph',
  'available_categories'
];

async function verifyTables() {
  try {
    const pool = new Pool(pgConfig);
    const client = await pool.connect();
    
    console.log('\nVerificando tablas básicas...');
    
    for (const tableName of BASIC_TABLES) {
      console.log(`\nVerificando ${tableName}:`);
      
      // Verificar existencia de la tabla
      const exists = await client.query(`
        SELECT EXISTS (
          SELECT FROM pg_tables
          WHERE schemaname = 'public'
          AND tablename = $1
        )
      `, [tableName]);
      
      if (!exists.rows[0].exists) {
        console.error(`¡Error! La tabla ${tableName} no existe`);
        continue;
      }
      
      // Verificar estructura de la tabla
      const columns = await client.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1 
        ORDER BY ordinal_position
      `, [tableName]);
      
      console.log('Columnas:');
      columns.rows.forEach(row => {
        console.log(`- ${row.column_name} (${row.data_type})`);
      });
      
      // Verificar datos
      const count = await client.query(`SELECT COUNT(*) as count FROM ${tableName}`);
      console.log(`Total registros: ${count.rows[0].count}`);
    }
    
    client.release();
    pool.end();
    
    console.log('\nVerificación de tablas completada');
  } catch (error) {
    console.error('Error al verificar tablas:', error);
  }
}

verifyTables();
