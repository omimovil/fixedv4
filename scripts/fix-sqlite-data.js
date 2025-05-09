const sqlite3 = require('sqlite3').verbose();

async function fixSQLiteData() {
  try {
    const db = new sqlite3.Database('.tmp/data.db');

    console.log('\n=== Corrigiendo Datos en SQLite ===');

    // 1. Corregir payment_methods
    console.log('\n=== Corrigiendo payment_methods ===');
    db.run(`
      UPDATE payment_methods 
      SET description = CASE 
        WHEN name = 'Paypal' THEN 'Pago con PayPal'
        WHEN name = 'Card' THEN 'Pago con Tarjeta'
        WHEN name = 'PaymentOnDelivery' THEN 'Pago contra entrega'
      END
      WHERE description IS NULL OR description = 'undefined'
    `);

    // 2. Corregir delivery_dates
    console.log('\n=== Corrigiendo delivery_dates ===');
    db.run(`
      UPDATE delivery_dates 
      SET description = CASE 
        WHEN id = 1 THEN 'Entrega inmediata'
        WHEN id = 2 THEN 'Entrega en 24 horas'
        WHEN id = 3 THEN 'Entrega en 48 horas'
        WHEN id = 7 THEN 'Entrega inmediata'
        WHEN id = 8 THEN 'Entrega en 24 horas'
        WHEN id = 9 THEN 'Entrega en 48 horas'
      END
      WHERE description IS NULL OR description = 'undefined'
    `);

    // 3. Corregir orders
    console.log('\n=== Corrigiendo orders ===');
    db.run(`
      UPDATE orders 
      SET 
        total = CASE 
          WHEN id IN (1, 11) THEN 100.00
          WHEN id IN (2, 12) THEN 150.00
          WHEN id IN (3, 13) THEN 200.00
          WHEN id IN (4, 14) THEN 250.00
          WHEN id IN (5, 15) THEN 300.00
        END,
        status = CASE 
          WHEN id IN (1, 2, 3) THEN 'pending'
          WHEN id IN (4, 5) THEN 'completed'
          WHEN id IN (11, 12, 13) THEN 'pending'
          WHEN id IN (14, 15) THEN 'completed'
        END
      WHERE total IS NULL OR total = 'undefined' OR 
            status IS NULL OR status = 'undefined'
    `);

    console.log('\n=== Datos corregidos ===');
    db.close();
  } catch (error) {
    console.error('Error al corregir datos en SQLite:', error);
  }
}

fixSQLiteData();
