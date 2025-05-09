const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function fixUserIds() {
  try {
    const dbPath = path.join(__dirname, '../.tmp/data.db');
    const db = new sqlite3.Database(dbPath);
    
    console.log('\nActualizando IDs de usuario...');
    
    // Tablas que necesitan actualización
    const tables = [
      'orders',
      'payment_methods',
      'products',
      'shipping_states'
    ];
    
    for (const table of tables) {
      console.log(`\nActualizando ${table}...`);
      
      // Actualizar created_by_id
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE ${table} 
          SET created_by_id = 1 
          WHERE created_by_id = 2
        `, err => err ? reject(err) : resolve());
      });
      
      // Actualizar updated_by_id
      await new Promise((resolve, reject) => {
        db.run(`
          UPDATE ${table} 
          SET updated_by_id = 1 
          WHERE updated_by_id = 2
        `, err => err ? reject(err) : resolve());
      });
      
      console.log(`${table} actualizado exitosamente`);
    }
    
    db.close();
    console.log('\nActualización de IDs de usuario completada');
  } catch (error) {
    console.error('Error al actualizar IDs de usuario:', error);
  }
}

fixUserIds();
