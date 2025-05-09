const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function verifyTableStructure() {
  try {
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Verificando Estructura de Tablas ===');

    // Tablas a verificar
    const tablesToVerify = [
      'orders',
      'products',
      'payment_methods',
      'delivery_dates'
    ];

    for (const table of tablesToVerify) {
      console.log(`\n=== Estructura de ${table} ===`);
      
      // Obtener columnas
      const columns = await pgPool.query(`
        SELECT column_name, data_type 
        FROM information_schema.columns 
        WHERE table_name = $1
      `, [table]);
      
      console.log('\nColumnas:');
      columns.rows.forEach(col => {
        console.log(`- ${col.column_name} (${col.data_type})`);
      });
      
      // Obtener ejemplo de datos
      const exampleData = await pgPool.query(`
        SELECT * FROM ${table} LIMIT 1
      `);
      
      if (exampleData.rows.length > 0) {
        console.log('\nEjemplo de datos:');
        Object.entries(exampleData.rows[0]).forEach(([key, value]) => {
          console.log(`- ${key}: ${value}`);
        });
      } else {
        console.log('\nNo hay datos en esta tabla');
      }
    }

    pgPool.end();
  } catch (error) {
    console.error('Error al verificar estructura de tablas:', error);
  }
}

verifyTableStructure();
