const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function verifyRolesAndUsers() {
  try {
    const pool = new Pool(pgConfig);
    const client = await pool.connect();
    
    try {
      console.log('\n=== Verificando roles ===');
      
      // Obtener roles
      const roles = await client.query('SELECT id, name, type FROM strapi_roles');
      console.log('Roles existentes:');
      roles.rows.forEach(role => {
        console.log(`- ID: ${role.id}, Nombre: ${role.name}, Tipo: ${role.type}`);
      });
      
      console.log('\n=== Verificando usuarios ===');
      
      // Obtener usuarios con sus roles
      const users = await client.query(`
        SELECT u.id, u.email, r.name as role_name 
        FROM strapi_users u 
        JOIN strapi_roles r ON u.role = r.id
      `);
      console.log('Usuarios existentes:');
      users.rows.forEach(user => {
        console.log(`- ID: ${user.id}, Email: ${user.email}, Rol: ${user.role_name}`);
      });
      
      // Verificar referencias en otras tablas
      const tables = [
        'orders',
        'payment_methods',
        'products',
        'shipping_states'
      ];
      
      console.log('\n=== Verificando referencias de usuarios ===');
      for (const table of tables) {
        console.log(`\nTabla: ${table}`);
        
        // Verificar created_by_id
        const createdResult = await client.query(`
          SELECT DISTINCT created_by_id, COUNT(*) as count 
          FROM ${table} 
          WHERE created_by_id IS NOT NULL 
          GROUP BY created_by_id
        `);
        
        if (createdResult.rows.length > 0) {
          console.log('created_by_id referencias:');
          createdResult.rows.forEach(row => {
            console.log(`- ID: ${row.created_by_id}, Conteo: ${row.count}`);
          });
        } else {
          console.log('No hay referencias de created_by_id');
        }
        
        // Verificar updated_by_id
        const updatedResult = await client.query(`
          SELECT DISTINCT updated_by_id, COUNT(*) as count 
          FROM ${table} 
          WHERE updated_by_id IS NOT NULL 
          GROUP BY updated_by_id
        `);
        
        if (updatedResult.rows.length > 0) {
          console.log('updated_by_id referencias:');
          updatedResult.rows.forEach(row => {
            console.log(`- ID: ${row.updated_by_id}, Conteo: ${row.count}`);
          });
        } else {
          console.log('No hay referencias de updated_by_id');
        }
      }
    } finally {
      client.release();
    }
    
  } catch (error) {
    console.error('Error al verificar roles y usuarios:', error);
  }
}

verifyRolesAndUsers();
