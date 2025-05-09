const sqlite3 = require('sqlite3').verbose();

async function verifySQLiteData() {
  try {
    const db = new sqlite3.Database('.tmp/data.db');

    console.log('\n=== Verificando Datos en SQLite ===');

    // 1. payment_methods
    console.log('\n=== payment_methods ===');
    db.all('SELECT * FROM payment_methods', (err, rows) => {
      if (err) throw err;
      console.log(`\nEncontrados ${rows.length} métodos de pago:`);
      rows.forEach(method => {
        console.log(`\nMétodo ID: ${method.id}`);
        console.log(`- Nombre: ${method.name}`);
        console.log(`- Descripción: ${method.content}`);
        console.log(`- Creado: ${new Date(method.created_at).toISOString()}`);
        console.log(`- Actualizado: ${new Date(method.updated_at).toISOString()}`);
      });
    });

    // 2. delivery_dates
    console.log('\n=== delivery_dates ===');
    db.all('SELECT * FROM delivery_dates', (err, rows) => {
      if (err) throw err;
      console.log(`\nEncontradas ${rows.length} fechas de entrega:`);
      rows.forEach(date => {
        console.log(`\nFecha ID: ${date.id}`);
        console.log(`- Nombre: ${date.delivery_date_name}`);
        console.log(`- Creado: ${new Date(date.created_at).toISOString()}`);
        console.log(`- Actualizado: ${new Date(date.updated_at).toISOString()}`);
      });
    });

    // 3. orders
    console.log('\n=== orders ===');
    db.all('SELECT * FROM orders', (err, rows) => {
      if (err) throw err;
      console.log(`\nEncontradas ${rows.length} órdenes:`);
      rows.forEach(order => {
        console.log(`\nOrden ID: ${order.id}`);
        console.log(`- Total: ${order.total_price}`);
        console.log(`- Estado: ${order.order_status}`);
        console.log(`- Precio: ${order.price}`);
        console.log(`- Cantidad: ${order.quantity}`);
        console.log(`- Creada: ${new Date(order.created_at).toISOString()}`);
        console.log(`- Actualizada: ${new Date(order.updated_at).toISOString()}`);
      });
    });

    db.close();
  } catch (error) {
    console.error('Error al verificar datos en SQLite:', error);
  }
}

verifySQLiteData();
