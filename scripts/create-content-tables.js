const { Pool } = require('pg');

const pgConfig = {
  user: 'postgres',
  host: 'localhost',
  database: 'fixedv4',
  password: 'ominey',
  port: 5432,
  ssl: false
};

const TABLES = {
  address: `
    CREATE TABLE address (
      id SERIAL PRIMARY KEY,
      street VARCHAR(255),
      city VARCHAR(255),
      state VARCHAR(255),
      postal_code VARCHAR(20),
      country VARCHAR(255),
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL
    )
  `,
  brands: `
    CREATE TABLE brands (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      slug VARCHAR(255),
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      locale VARCHAR(255),
      document_id VARCHAR(255),
      published_at TIMESTAMP
    )
  `,
  categories: `
    CREATE TABLE categories (
      id SERIAL PRIMARY KEY,
      title VARCHAR(255),
      description TEXT,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      url VARCHAR(255),
      locale VARCHAR(255),
      document_id VARCHAR(255),
      published_at TIMESTAMP
    )
  `,
  colors: `
    CREATE TABLE colors (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      color_id VARCHAR(255),
      hex_code VARCHAR(255),
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      locale VARCHAR(255),
      document_id VARCHAR(255),
      published_at TIMESTAMP
    )
  `,
  contact_addresses: `
    CREATE TABLE contact_addresses (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255),
      lastname VARCHAR(255),
      state VARCHAR(255),
      country VARCHAR(255),
      city VARCHAR(255),
      phone_number VARCHAR(255),
      address_one VARCHAR(255),
      address_two VARCHAR(255),
      author_id VARCHAR(255),
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      published_at TIMESTAMP,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      document_id VARCHAR(255),
      locale VARCHAR(255)
    )
  `,
  countries: `
    CREATE TABLE countries (
      id SERIAL PRIMARY KEY,
      document_id VARCHAR(255),
      name VARCHAR(255),
      city VARCHAR(255),
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      published_at TIMESTAMP,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      locale VARCHAR(255)
    )
  `,
  delivery_dates: `
    CREATE TABLE delivery_dates (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      published_at TIMESTAMP,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      delivery_date_name VARCHAR(255),
      document_id VARCHAR(255),
      locale VARCHAR(255)
    )
  `,
  favorite_products: `
    CREATE TABLE favorite_products (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      locale VARCHAR(255),
      user_id VARCHAR(255),
      document_id VARCHAR(255),
      published_at TIMESTAMP
    )
  `,
  orders: `
    CREATE TABLE orders (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      published_at TIMESTAMP,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      locale VARCHAR(255),
      total_price FLOAT,
      document_id VARCHAR(255),
      shipping_price FLOAT,
      order_status VARCHAR(255),
      paypal_order_id VARCHAR(255),
      notes VARCHAR(255),
      price FLOAT,
      quantity INTEGER,
      options JSONB
    )
  `,
  payment_methods: `
    CREATE TABLE payment_methods (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255),
      content VARCHAR(255),
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      published_at TIMESTAMP,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      document_id VARCHAR(255),
      locale VARCHAR(255)
    )
  `,
  payments: `
    CREATE TABLE payments (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      published_at TIMESTAMP,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      locale VARCHAR(255),
      document_id VARCHAR(255),
      paypal_transaction_id VARCHAR(255),
      payer_email VARCHAR(255),
      amount FLOAT,
      currency VARCHAR(255),
      payment_status VARCHAR(255),
      raw_response JSONB
    )
  `,
  personal_addresses: `
    CREATE TABLE personal_addresses (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255),
      lastname VARCHAR(255),
      address_two VARCHAR(255),
      address_one VARCHAR(255),
      city VARCHAR(255),
      country VARCHAR(255),
      state VARCHAR(255),
      phone_number VARCHAR(255),
      author_id VARCHAR(255),
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      zip_code VARCHAR(255),
      document_id VARCHAR(255),
      locale VARCHAR(255),
      published_at TIMESTAMP
    )
  `,
  products: `
    CREATE TABLE products (
      id SERIAL PRIMARY KEY,
      title TEXT,
      description TEXT,
      product_id VARCHAR(255),
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      locale VARCHAR(255),
      price FLOAT,
      stock INTEGER,
      uuid VARCHAR(255),
      shipping_price VARCHAR(255),
      condition VARCHAR(255),
      brand VARCHAR(255),
      shipping_date VARCHAR(255),
      sku VARCHAR(255),
      returns VARCHAR(255),
      warranty VARCHAR(255),
      sold_times INTEGER,
      on_offer BOOLEAN,
      full_description TEXT,
      document_id VARCHAR(255),
      published_at TIMESTAMP,
      rich_text JSONB,
      tags TEXT,
      country VARCHAR(255)
    )
  `,
  purchases: `
    CREATE TABLE purchases (
      id SERIAL PRIMARY KEY,
      product_id VARCHAR(255),
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      published_at TIMESTAMP,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      document_id VARCHAR(255),
      locale VARCHAR(255)
    )
  `,
  ratings: `
    CREATE TABLE ratings (
      id SERIAL PRIMARY KEY,
      star_quantity INTEGER,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      published_at TIMESTAMP,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      document_id VARCHAR(255),
      locale VARCHAR(255)
    )
  `,
  reviews: `
    CREATE TABLE reviews (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      published_at TIMESTAMP,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      locale VARCHAR(255),
      content TEXT,
      document_id VARCHAR(255)
    )
  `,
  shipping_states: `
    CREATE TABLE shipping_states (
      id SERIAL PRIMARY KEY,
      to_ship BOOLEAN,
      shipped BOOLEAN,
      return BOOLEAN,
      delivered BOOLEAN,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      published_at TIMESTAMP,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      document_id VARCHAR(255),
      locale VARCHAR(255)
    )
  `,
  shopping_carts: `
    CREATE TABLE shopping_carts (
      id SERIAL PRIMARY KEY,
      uploaded_at DATE,
      active BOOLEAN,
      cart_id VARCHAR(255),
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      quantity INTEGER,
      subtotal FLOAT,
      availability BOOLEAN,
      brand VARCHAR(255),
      discount FLOAT,
      product_id VARCHAR(255),
      size_id VARCHAR(255),
      color_id VARCHAR(255),
      color_name VARCHAR(255),
      price FLOAT,
      title VARCHAR(255),
      document_id VARCHAR(255),
      locale VARCHAR(255),
      published_at TIMESTAMP,
      costumer_id VARCHAR(255),
      sku VARCHAR(255),
      color_hex VARCHAR(255),
      size_name VARCHAR(255),
      available_stock INTEGER,
      vendor VARCHAR(255),
      sub_total FLOAT,
      total_items INTEGER,
      currency VARCHAR(255),
      applied_coupon VARCHAR(255),
      discount_amount FLOAT,
      shipping_cost FLOAT,
      estimated_taxes FLOAT,
      last_updated TIMESTAMP,
      image_url VARCHAR(255)
    )
  `,
  sizes: `
    CREATE TABLE sizes (
      id SERIAL PRIMARY KEY,
      created_at TIMESTAMP NOT NULL,
      updated_at TIMESTAMP NOT NULL,
      published_at TIMESTAMP,
      created_by_id INTEGER REFERENCES strapi_users(id),
      updated_by_id INTEGER REFERENCES strapi_users(id),
      label VARCHAR(255),
      available BOOLEAN,
      quantity BIGINT,
      document_id VARCHAR(255),
      locale VARCHAR(255)
    )
  `
};

async function createTables() {
  try {
    const pool = new Pool(pgConfig);
    
    console.log('\nCreando tablas de contenido...');
    
    for (const [tableName, sql] of Object.entries(TABLES)) {
      console.log(`\nCreando tabla: ${tableName}`);
      
      const client = await pool.connect();
      try {
        await client.query(`DROP TABLE IF EXISTS ${tableName} CASCADE`);
        await client.query(sql);
        console.log(`Tabla ${tableName} creada exitosamente`);
      } finally {
        client.release();
      }
    }
    
    console.log('\nTodas las tablas creadas exitosamente');
  } catch (error) {
    console.error('Error creando tablas:', error);
  }
}

createTables();
