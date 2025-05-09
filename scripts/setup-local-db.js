const { Client } = require('pg');
const fs = require('fs');
const path = require('path');

async function setupDatabase() {
  try {
    // Configuración de conexión local con la contraseña correcta
    const localConfig = {
      user: 'postgres',
      host: 'localhost',
      port: 5432,
      database: 'postgres',
      password: 'ominey',
      ssl: false
    };

    // Crear cliente de conexión
    const client = new Client(localConfig);
    await client.connect();

    // Crear la base de datos
    await client.query('CREATE DATABASE fixedv4');
    await client.query('GRANT ALL PRIVILEGES ON DATABASE fixedv4 TO postgres');

    console.log('Base de datos creada exitosamente');

    // Cerrar conexión
    await client.end();

    // Actualizar .env.migration con la contraseña correcta
    const envContent = `DATABASE_URL=postgresql://postgres:ominey@localhost:5432/fixedv4
NODE_ENV=development
JWT_SECRET=tu_jwt_secret`;

    fs.writeFileSync('.env.migration', envContent);
    console.log('Archivo .env.migration actualizado');

  } catch (error) {
    console.error('Error configurando la base de datos:', error);
    process.exit(1);
  }
}

// Ejecutar el script
setupDatabase();
