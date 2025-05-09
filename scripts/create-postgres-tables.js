const { Pool, Client } = require('pg');
const path = require('path');

// Configuración de PostgreSQL
const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
});

// Definir las tablas
const TABLES = [
  {
    name: 'strapi_roles',
    schema: `
      CREATE TABLE strapi_roles (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        type VARCHAR(255) UNIQUE,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )`
  },
  {
    name: 'strapi_users',
    schema: `
      CREATE TABLE strapi_users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        provider VARCHAR(255) DEFAULT 'local',
        confirmed BOOLEAN DEFAULT false,
        blocked BOOLEAN DEFAULT false,
        role INTEGER,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        FOREIGN KEY (role) REFERENCES strapi_roles(id)
      )`
  },
  {
    name: 'strapi_webhooks',
    schema: `
      CREATE TABLE strapi_webhooks (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(255) NOT NULL,
        headers TEXT,
        events TEXT,
        enabled BOOLEAN DEFAULT true,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )`
  },
  {
    name: 'strapi_files',
    schema: `
      CREATE TABLE strapi_files (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        alternativeText TEXT,
        caption TEXT,
        width INTEGER,
        height INTEGER,
        formats JSONB,
        hash VARCHAR(255),
        ext VARCHAR(255),
        mime VARCHAR(255),
        size DECIMAL(10,2),
        url VARCHAR(255),
        previewUrl VARCHAR(255),
        provider VARCHAR(255),
        provider_metadata JSONB,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )`
  },
  {
    name: 'strapi_file_morph',
    schema: `
      CREATE TABLE strapi_file_morph (
        id SERIAL PRIMARY KEY,
        model_name VARCHAR(255),
        model_id INTEGER,
        field VARCHAR(255),
        file INTEGER,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        FOREIGN KEY (file) REFERENCES strapi_files(id)
      )`
  },
  {
    name: 'address',
    schema: `
      CREATE TABLE address (
        id SERIAL PRIMARY KEY,
        street TEXT,
        city VARCHAR(255),
        state VARCHAR(255),
        postal_code VARCHAR(20),
        country VARCHAR(255),
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL
      )`
  },
  {
    name: 'available_categories',
    schema: `
      CREATE TABLE available_categories (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        category_id INTEGER,
        created_at TIMESTAMP NOT NULL,
        updated_at TIMESTAMP NOT NULL,
        created_by_id INTEGER,
        updated_by_id INTEGER,
        slug VARCHAR(255),
        description TEXT,
        document_id INTEGER,
        locale VARCHAR(5),
        published_at TIMESTAMP,
        FOREIGN KEY (created_by_id) REFERENCES strapi_users(id),
        FOREIGN KEY (updated_by_id) REFERENCES strapi_users(id)
      )`
  }
];

async function createTables() {
  try {
    await client.connect();
    
    // Crear las tablas en orden específico
    for (const table of TABLES) {
      console.log(`\nCreando tabla: ${table.name}`);
      await client.query(table.schema);
      console.log(`Tabla ${table.name} creada exitosamente`);
    }

    console.log('\nTodas las tablas han sido creadas exitosamente');
  } catch (error) {
    console.error('Error creando las tablas:', error);
    process.exit(1);
  } finally {
    await client.end();
  }
}

// Ejecutar el script
createTables();
