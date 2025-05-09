const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function verifyDatabaseStructure() {
  try {
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Verificando estructura de la base de datos ===');

    // 1. Obtener todas las tablas
    const tables = await pgPool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log(`\nEncontradas ${tables.rows.length} tablas:`);
    tables.rows.forEach(table => {
      console.log(`\nTabla: ${table.table_name}`);
      
      // Obtener columnas de cada tabla
      const columns = await pgPool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
        ORDER BY ordinal_position
      `, [table.table_name]);

      console.log('Columnas:');
      columns.rows.forEach(column => {
        console.log(`- ${column.column_name} (${column.data_type})`);
      });
    });

    pgPool.end();
  } catch (error) {
    console.error('Error al verificar estructura de la base de datos:', error);
  }
}

verifyDatabaseStructure();
