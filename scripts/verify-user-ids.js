const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function verifyUserIds() {
  try {
    const pool = new Pool(pgConfig);
    const client = await pool.connect();
    
    try {
      console.log('\nVerificando IDs de usuarios...');
      
      // Obtener todos los usuarios
      const users = await client.query('SELECT id FROM strapi_users');
      console.log('IDs de usuarios existentes:', users.rows.map(u => u.id));
      
      // Verificar referencias en otras tablas
      const tables = [
        'orders',
        'payment_methods',
        'products',
        'shipping_states'
      ];
      
      for (const table of tables) {
        console.log(`\nVerificando referencias en ${table}...`);
        const result = await client.query(`
          SELECT DISTINCT created_by_id 
          FROM ${table} 
          WHERE created_by_id IS NOT NULL
        `);
        
        if (result.rows.length > 0) {
          console.log('IDs encontrados:', result.rows.map(r => r.created_by_id));
        } else {
          console.log('No se encontraron referencias');
        }
      }
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error al verificar usuarios:', error);
  }
}

verifyUserIds();
