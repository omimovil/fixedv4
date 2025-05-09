const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function createMissingRelations() {
  try {
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Creando tablas de relaciones faltantes ===');

    // 1. Crear tabla products_colors si no existe
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS products_colors (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        color_id INTEGER REFERENCES colors(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 2. Crear tabla products_sizes si no existe
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS products_sizes (
        id SERIAL PRIMARY KEY,
        product_id INTEGER REFERENCES products(id),
        size_id INTEGER REFERENCES sizes(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 3. Crear tabla strapi_file_morph si no existe
    await pgPool.query(`
      CREATE TABLE IF NOT EXISTS strapi_file_morph (
        id SERIAL PRIMARY KEY,
        model_name VARCHAR(255),
        model_id INTEGER,
        field VARCHAR(255),
        file INTEGER REFERENCES upload_files(id),
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('\nTablas creadas exitosamente');
    pgPool.end();
  } catch (error) {
    console.error('Error al crear tablas:', error);
  }
}

createMissingRelations();
