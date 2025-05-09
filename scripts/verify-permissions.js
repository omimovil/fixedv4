const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function verifyPermissions() {
  try {
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Verificación de Permisos ===');
    
    // 1. Verificar permisos
    const permissions = await pgPool.query(`
      SELECT p.id, p.action, p.subject, p.properties, p.conditions, r.name as role_name 
      FROM strapi_permissions p
      JOIN strapi_roles r ON p.role = r.id
      ORDER BY p.id
    `);
    
    console.log(`\nEncontrados ${permissions.rows.length} permisos:`);
    permissions.rows.forEach(perm => {
      console.log(`\nPermiso ID: ${perm.id}`);
      console.log(`- Acción: ${perm.action}`);
      console.log(`- Asignado a rol: ${perm.role_name}`);
      console.log(`- Propiedades: ${JSON.stringify(perm.properties)}`);
      console.log(`- Condiciones: ${JSON.stringify(perm.conditions)}`);
    });
    
    // 2. Verificar roles con sus permisos
    const rolesWithPermissions = await pgPool.query(`
      SELECT r.id, r.name, COUNT(p.id) as permission_count 
      FROM strapi_roles r
      LEFT JOIN strapi_permissions p ON r.id = p.role
      GROUP BY r.id, r.name
      ORDER BY r.id
    `);
    
    console.log('\n=== Roles y sus Permisos ===');
    rolesWithPermissions.rows.forEach(role => {
      console.log(`\nRol ID: ${role.id}, Nombre: ${role.name}`);
      console.log(`- Número de permisos: ${role.permission_count}`);
    });
    
    pgPool.end();
  } catch (error) {
    console.error('Error en la verificación:', error);
  }
}

verifyPermissions();
