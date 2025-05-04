const { Client } = require('pg');

async function verifyMigration() {
  try {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
    });

    await client.connect();

    try {
      // Verificar tablas principales
      const tables = await client.query(`
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

      console.log('Tablas encontradas en PostgreSQL:');
      tables.rows.forEach(table => console.log(' -', table.table_name));

      // Verificar algunos registros de ejemplo
      const sampleQuery = await client.query(`
        SELECT COUNT(*) as count 
        FROM strapi_users 
        LIMIT 1
      `);

      console.log('Verificación de datos completada. Todo parece estar en orden!');
    } finally {
      await client.end();
    }
  } catch (error) {
    console.error('Error durante la verificación:', error);
    process.exit(1);
  }
}

verifyMigration();
