const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function verifyUsersAndRoles() {
  try {
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Verificación de Usuarios y Roles ===');
    
    // 1. Verificar roles
    console.log('\n=== Roles ===');
    const roles = await pgPool.query(`
      SELECT id, name, description, type 
      FROM strapi_roles
    `);
    
    console.log(`\nEncontrados ${roles.rows.length} roles:`);
    roles.rows.forEach(role => {
      console.log(`- ID: ${role.id}, Nombre: ${role.name}, Tipo: ${role.type}`);
    });
    
    // 2. Verificar usuarios
    console.log('\n=== Usuarios ===');
    const users = await pgPool.query(`
      SELECT id, username, email, provider, confirmed, blocked, role 
      FROM strapi_users
    `);
    
    console.log(`\nEncontrados ${users.rows.length} usuarios:`);
    users.rows.forEach(user => {
      console.log(`- ID: ${user.id}, Username: ${user.username}, Email: ${user.email}, Role: ${user.role}`);
    });
    
    // 3. Verificar permisos
    console.log('\n=== Permisos ===');
    const permissions = await pgPool.query(`
      SELECT p.id, p.action, r.name as role_name 
      FROM strapi_permissions p
      JOIN strapi_roles r ON p.role = r.id
    `);
    
    console.log(`\nEncontrados ${permissions.rows.length} permisos:`);
    permissions.rows.forEach(perm => {
      console.log(`- ID: ${perm.id}, Acción: ${perm.action}, Rol: ${perm.role_name}`);
    });
    
    // 4. Verificar relaciones usuario-rol
    console.log('\n=== Relaciones Usuario-Rol ===');
    const userRoles = await pgPool.query(`
      SELECT u.id as user_id, u.username, r.id as role_id, r.name as role_name 
      FROM strapi_users u
      JOIN strapi_roles r ON u.role = r.id
    `);
    
    console.log(`\nEncontradas ${userRoles.rows.length} relaciones:`);
    userRoles.rows.forEach(rel => {
      console.log(`- Usuario: ${rel.username} (ID: ${rel.user_id}) tiene rol: ${rel.role_name} (ID: ${rel.role_id})`);
    });
    
    pgPool.end();
  } catch (error) {
    console.error('Error en la verificación:', error);
  }
}

verifyUsersAndRoles();
