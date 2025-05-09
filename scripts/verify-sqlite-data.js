const sqlite3 = require('sqlite3').verbose();
const path = require('path');

async function verifySQLiteData() {
  try {
    const db = new sqlite3.Database('.tmp/data.db');

    console.log('\n=== Verificando Datos en SQLite ===');

    // 1. Verificar payment_methods
    console.log('\n=== payment_methods ===');
    const paymentMethods = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM payment_methods', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });

    console.log(`\nEncontrados ${paymentMethods.length} métodos de pago:`);
    paymentMethods.forEach(method => {
      console.log(`\nMétodo ID: ${method.id}`);
      console.log(`- Nombre: ${method.name}`);
      console.log(`- Descripción: ${method.description}`);
    });

    // 2. Verificar delivery_dates
    console.log('\n=== delivery_dates ===');
    const deliveryDates = await new Promise((resolve, reject) => {
      db.all('SELECT * FROM delivery_dates', (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    }
    
    // Verificar referencias a usuarios
    console.log('\n=== Referencias a usuarios ===');
    for (const table of contentTables) {
      console.log(`\nTabla: ${table}`);
      await new Promise((resolve, reject) => {
        db.all(`
          SELECT DISTINCT created_by_id, COUNT(*) as count 
          FROM ${table} 
          WHERE created_by_id IS NOT NULL 
          GROUP BY created_by_id
        `, (err, rows) => {
          if (err) reject(err);
          if (rows.length > 0) {
            console.log('created_by_id referencias:');
            rows.forEach(row => {
              console.log(`- ID: ${row.created_by_id}, Conteo: ${row.count}`);
            });
          } else {
            console.log('No hay referencias de created_by_id');
          }
          resolve();
        });
      });
    }
    
    db.close();
    console.log('\nVerificación completada');
  } catch (error) {
    console.error('Error al verificar datos:', error);
  }
}

verifySQLiteData();
