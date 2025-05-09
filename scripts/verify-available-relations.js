const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function verifyAvailableRelations() {
  try {
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Verificando relaciones disponibles ===');

    // 1. Verificar colores disponibles
    console.log('\n=== Colores disponibles ===');
    const colors = await pgPool.query(`
      SELECT id, name, hex_code 
      FROM colors
      ORDER BY id
    `);

    console.log(`\nEncontrados ${colors.rows.length} colores:`);
    colors.rows.forEach(color => {
      console.log(`\nColor ID: ${color.id}`);
      console.log(`- Nombre: ${color.name}`);
      console.log(`- Código HEX: ${color.hex_code}`);
    });

    // 2. Verificar tallas disponibles
    console.log('\n=== Tallas disponibles ===');
    const sizes = await pgPool.query(`
      SELECT id, label, available, quantity 
      FROM sizes
      WHERE available = true
      ORDER BY id
    `);

    console.log(`\nEncontradas ${sizes.rows.length} tallas disponibles:`);
    sizes.rows.forEach(size => {
      console.log(`\nTalla ID: ${size.id}`);
      console.log(`- Etiqueta: ${size.label}`);
      console.log(`- Cantidad: ${size.quantity}`);
    });

    // 3. Verificar imágenes disponibles
    console.log('\n=== Imágenes disponibles ===');
    const images = await pgPool.query(`
      SELECT id, url, alternativetext, caption 
      FROM upload_files
      WHERE url LIKE '%multimeter%' OR url LIKE '%repair%'
      ORDER BY id
    `);

    console.log(`\nEncontradas ${images.rows.length} imágenes:`);
    images.rows.forEach(image => {
      console.log(`\nImagen ID: ${image.id}`);
      console.log(`- URL: ${image.url}`);
      console.log(`- Texto alternativo: ${image.alternativetext}`);
      console.log(`- Descripción: ${image.caption}`);
    });

    pgPool.end();
  } catch (error) {
    console.error('Error al verificar relaciones disponibles:', error);
  }
}

verifyAvailableRelations();
