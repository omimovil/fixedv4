const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function verifyStrapiData() {
  try {
    const dbPath = path.join(__dirname, '../.tmp/data.db');
    const db = new sqlite3.Database(dbPath);
    
    console.log(`\n=== Verificando base de datos Strapi en: ${dbPath} ===`);
    
    // Verificar roles
    console.log('\n=== Roles ===');
    db.all('SELECT * FROM strapi_roles ORDER BY id', (err, roles) => {
      if (err) {
        console.error('Error al obtener roles:', err);
        return;
      }
      console.log(`Total roles: ${roles.length}`);
      roles.forEach(role => {
        console.log(`ID: ${role.id}, Nombre: ${role.name}, Tipo: ${role.type}`);
      });
    });
    
    // Verificar usuarios
    console.log('\n=== Usuarios ===');
    db.all('SELECT * FROM strapi_users ORDER BY id', (err, users) => {
      if (err) {
        console.error('Error al obtener usuarios:', err);
        return;
      }
      console.log(`Total usuarios: ${users.length}`);
      users.forEach(user => {
        console.log(`
ID: ${user.id}
Email: ${user.email}
Username: ${user.username}
Provider: ${user.provider}
Role: ${user.role}
Created at: ${new Date(user.created_at).toISOString()}
Updated at: ${new Date(user.updated_at).toISOString()}
`);
      });
    });
    
    // Verificar datos de contenido
    const contentTables = [
      'brands',
      'categories',
      'colors',
      'delivery_dates',
      'orders',
      'payment_methods',
      'products',
      'shipping_states',
      'sizes'
    ];
    
    for (const table of contentTables) {
      console.log(`\n=== ${table} ===`);
      db.get(`SELECT COUNT(*) as count FROM ${table}`, (err, row) => {
        if (err) {
          console.error(`Error al contar registros en ${table}:`, err);
          return;
        }
        console.log(`Total registros: ${row.count}`);
      });
    }
    
    // Verificar referencias a usuarios
    console.log('\n=== Referencias a usuarios ===');
    for (const table of contentTables) {
      console.log(`\nTabla: ${table}`);
      db.all(`
        SELECT DISTINCT created_by_id, COUNT(*) as count 
        FROM ${table} 
        WHERE created_by_id IS NOT NULL 
        GROUP BY created_by_id
      `, (err, rows) => {
        if (err) {
          console.error(`Error al verificar referencias en ${table}:`, err);
          return;
        }
        if (rows.length > 0) {
          console.log('created_by_id referencias:');
          rows.forEach(row => {
            console.log(`- ID: ${row.created_by_id}, Conteo: ${row.count}`);
          });
        } else {
          console.log('No hay referencias de created_by_id');
        }
      });
    }
    
    db.close();
  } catch (error) {
    console.error('Error:', error);
  }
}

verifyStrapiData();
