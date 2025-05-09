const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function addBasicPermissions() {
  try {
    const pgPool = new Pool(pgConfig);
    const client = await pgPool.connect();
    
    console.log('\n=== Agregando Permisos Básicos ===');
    
    // Obtener el ID del rol Administrador
    const adminRole = await client.query('SELECT id FROM strapi_roles WHERE name = $1', ['Administrator']);
    const adminRoleId = adminRole.rows[0].id;
    
    // Permisos básicos para el Administrador
    const basicPermissions = [
      // Permisos de usuarios
      { action: 'admin::users.users.create', role: adminRoleId },
      { action: 'admin::users.users.delete', role: adminRoleId },
      { action: 'admin::users.users.update', role: adminRoleId },
      { action: 'admin::users.users.read', role: adminRoleId },
      
      // Permisos de roles
      { action: 'admin::roles.roles.create', role: adminRoleId },
      { action: 'admin::roles.roles.delete', role: adminRoleId },
      { action: 'admin::roles.roles.update', role: adminRoleId },
      { action: 'admin::roles.roles.read', role: adminRoleId },
      
      // Permisos de contenido
      { action: 'admin::content-manager.explorer.create', role: adminRoleId },
      { action: 'admin::content-manager.explorer.delete', role: adminRoleId },
      { action: 'admin::content-manager.explorer.update', role: adminRoleId },
      { action: 'admin::content-manager.explorer.read', role: adminRoleId },
      
      // Permisos de medios
      { action: 'admin::upload.upload.create', role: adminRoleId },
      { action: 'admin::upload.upload.delete', role: adminRoleId },
      { action: 'admin::upload.upload.update', role: adminRoleId },
      { action: 'admin::upload.upload.read', role: adminRoleId },
      
      // Permisos de configuración
      { action: 'admin::settings.settings.update', role: adminRoleId },
      { action: 'admin::settings.settings.read', role: adminRoleId }
    ];
    
    // Insertar permisos
    for (const perm of basicPermissions) {
      try {
        await client.query(`
          INSERT INTO strapi_permissions (
            action, role, created_at, updated_at
          ) VALUES ($1, $2, NOW(), NOW())
        `, [perm.action, perm.role]);
        console.log(`Agregado permiso: ${perm.action}`);
      } catch (error) {
        console.error(`Error agregando permiso ${perm.action}:`, error);
      }
    }
    
    client.release();
    pgPool.end();
    
    console.log('\n=== Permisos agregados exitosamente ===');
  } catch (error) {
    console.error('Error:', error);
  }
}

addBasicPermissions();
