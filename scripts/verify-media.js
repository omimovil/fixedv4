const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function verifyMedia() {
  try {
    const pgPool = new Pool(pgConfig);
    
    console.log('\n=== Verificación de Archivos y Carpetas ===');
    
    // 1. Verificar archivos
    console.log('\n=== Archivos ===');
    const files = await pgPool.query(`
      SELECT id, name, alternativeText, caption, width, height, 
             formats, hash, ext, mime, size, url, previewUrl, 
             provider, provider_metadata, created_at, updated_at 
      FROM upload_files
    `);
    
    console.log(`\nEncontrados ${files.rows.length} archivos:`);
    files.rows.forEach(file => {
      console.log(`- ID: ${file.id}, Nombre: ${file.name}, Tamaño: ${file.size} bytes, URL: ${file.url}`);
    });
    
    // 2. Verificar carpetas
    console.log('\n=== Carpetas ===');
    const folders = await pgPool.query(`
      SELECT id, name, path_id, path, created_at, updated_at 
      FROM upload_folders
    `);
    
    console.log(`\nEncontradas ${folders.rows.length} carpetas:`);
    folders.rows.forEach(folder => {
      console.log(`- ID: ${folder.id}, Nombre: ${folder.name}, Path: ${folder.path}`);
    });
    
    // 3. Verificar relaciones archivo-carpeta
    console.log('\n=== Relaciones Archivo-Carpeta ===');
    const fileFolders = await pgPool.query(`
      SELECT ff.id, ff.folder_id, ff.file_id, 
             f.name as file_name, fo.name as folder_name 
      FROM upload_file_folders ff
      JOIN upload_files f ON ff.file_id = f.id
      JOIN upload_folders fo ON ff.folder_id = fo.id
    `);
    
    console.log(`\nEncontradas ${fileFolders.rows.length} relaciones:`);
    fileFolders.rows.forEach(rel => {
      console.log(`- Archivo: ${rel.file_name} (ID: ${rel.file_id}) en Carpeta: ${rel.folder_name} (ID: ${rel.folder_id})`);
    });
    
    pgPool.end();
  } catch (error) {
    console.error('Error en la verificación:', error);
  }
}

verifyMedia();
