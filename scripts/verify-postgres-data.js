const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

async function verifyPostgresData() {
  try {
    const pgPool = new Pool(pgConfig);

    console.log('\n=== Verificando Datos en PostgreSQL ===');

    // 1. payment_methods
    console.log('\n=== payment_methods ===');
    const paymentMethods = await pgPool.query(`
      SELECT id, name, content, created_at, updated_at 
      FROM payment_methods 
      ORDER BY id
    `);

    console.log(`\nEncontrados ${paymentMethods.rows.length} métodos de pago:`);
    paymentMethods.rows.forEach(method => {
      console.log(`\nMétodo ID: ${method.id}`);
      console.log(`- Nombre: ${method.name}`);
      console.log(`- Descripción: ${method.content}`);
      console.log(`- Creado: ${method.created_at}`);
      console.log(`- Actualizado: ${method.updated_at}`);
    });

    // 2. delivery_dates
    console.log('\n=== delivery_dates ===');
    const deliveryDates = await pgPool.query(`
      SELECT id, delivery_date_name, created_at, updated_at 
      FROM delivery_dates 
      ORDER BY id
    `);

    console.log(`\nEncontradas ${deliveryDates.rows.length} fechas de entrega:`);
    deliveryDates.rows.forEach(date => {
      console.log(`\nFecha ID: ${date.id}`);
      console.log(`- Nombre: ${date.delivery_date_name}`);
      console.log(`- Creado: ${date.created_at}`);
      console.log(`- Actualizado: ${date.updated_at}`);
    });

    // 3. orders
    console.log('\n=== orders ===');
    const orders = await pgPool.query(`
      SELECT id, total_price, order_status, price, quantity, 
             created_at, updated_at 
      FROM orders 
      ORDER BY id
    `);

    console.log(`\nEncontradas ${orders.rows.length} órdenes:`);
    orders.rows.forEach(order => {
      console.log(`\nOrden ID: ${order.id}`);
      console.log(`- Total: ${order.total_price}`);
      console.log(`- Estado: ${order.order_status}`);
      console.log(`- Precio: ${order.price}`);
      console.log(`- Cantidad: ${order.quantity}`);
      console.log(`- Creada: ${order.created_at}`);
      console.log(`- Actualizada: ${order.updated_at}`);
    });

    pgPool.end();
  } catch (error) {
    console.error('Error al verificar datos en PostgreSQL:', error);
  }
}

verifyPostgresData();
