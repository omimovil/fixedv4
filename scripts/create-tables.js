const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Crear la base de datos en el directorio .tmp
const dbPath = path.join(__dirname, '../.tmp/data.db');
const db = new sqlite3.Database(dbPath);

// Definir las tablas
const TABLES = [
  {
    name: 'strapi_roles',
    schema: `
      CREATE TABLE strapi_roles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description VARCHAR(255),
        type VARCHAR(255) UNIQUE,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
  },
  {
    name: 'strapi_users',
    schema: `
      CREATE TABLE strapi_users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        provider VARCHAR(255) DEFAULT 'local',
        confirmed BOOLEAN DEFAULT false,
        blocked BOOLEAN DEFAULT false,
        role INTEGER,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (role) REFERENCES strapi_roles(id)
      )`
  },
  {
    name: 'strapi_webhooks',
    schema: `
      CREATE TABLE strapi_webhooks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        url VARCHAR(255) NOT NULL,
        headers TEXT,
        events TEXT,
        enabled BOOLEAN DEFAULT true,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
  },
  {
    name: 'strapi_files',
    schema: `
      CREATE TABLE strapi_files (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        alternativeText TEXT,
        caption TEXT,
        width INTEGER,
        height INTEGER,
        formats TEXT,
        hash VARCHAR(255) NOT NULL,
        ext VARCHAR(255),
        mime VARCHAR(255) NOT NULL,
        size DECIMAL(10,2) NOT NULL,
        url TEXT,
        previewUrl TEXT,
        provider VARCHAR(255) NOT NULL,
        provider_metadata TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
  },
  {
    name: 'strapi_file_morph',
    schema: `
      CREATE TABLE strapi_file_morph (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        model_name VARCHAR(255) NOT NULL,
        model_id INTEGER NOT NULL,
        field VARCHAR(255) NOT NULL,
        file INTEGER NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (file) REFERENCES strapi_files(id)
      )`
  },
  {
    name: 'address',
    schema: `
      CREATE TABLE address (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        street VARCHAR(255) NOT NULL,
        city VARCHAR(255) NOT NULL,
        state VARCHAR(255) NOT NULL,
        postal_code VARCHAR(20) NOT NULL,
        country VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
  },
  {
    name: 'available_categories',
    schema: `
      CREATE TABLE available_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
  },
  {
    name: 'brands',
    schema: `
      CREATE TABLE brands (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        logo INTEGER,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (logo) REFERENCES strapi_files(id)
      )`
  },
  {
    name: 'categories',
    schema: `
      CREATE TABLE categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        image INTEGER,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (image) REFERENCES strapi_files(id)
      )`
  },
  {
    name: 'colors',
    schema: `
      CREATE TABLE colors (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(7) NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
  },
  {
    name: 'contact_addresses',
    schema: `
      CREATE TABLE contact_addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        address_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (address_id) REFERENCES address(id)
      )`
  },
  {
    name: 'cookies',
    schema: `
      CREATE TABLE cookies (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        value TEXT,
        expires DATETIME,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
  },
  {
    name: 'cookie_categories',
    schema: `
      CREATE TABLE cookie_categories (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
  },
  {
    name: 'cookie_popups',
    schema: `
      CREATE TABLE cookie_popups (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title VARCHAR(255) NOT NULL,
        message TEXT NOT NULL,
        accept_button_text VARCHAR(255) NOT NULL,
        reject_button_text VARCHAR(255) NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
  },
  {
    name: 'customers',
    schema: `
      CREATE TABLE customers (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        user_id INTEGER NOT NULL,
        first_name VARCHAR(255) NOT NULL,
        last_name VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        phone VARCHAR(20),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (user_id) REFERENCES strapi_users(id)
      )`
  },
  {
    name: 'countries',
    schema: `
      CREATE TABLE countries (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        code VARCHAR(2) NOT NULL UNIQUE,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
  },
  {
    name: 'delivery_dates',
    schema: `
      CREATE TABLE delivery_dates (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date DATE NOT NULL,
        available BOOLEAN DEFAULT true,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
  },
  {
    name: 'favorite_products',
    schema: `
      CREATE TABLE favorite_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`
  },
  {
    name: 'orders',
    schema: `
      CREATE TABLE orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        shipping_address_id INTEGER,
        billing_address_id INTEGER,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (shipping_address_id) REFERENCES address(id),
        FOREIGN KEY (billing_address_id) REFERENCES address(id)
      )`
  },
  {
    name: 'order_products',
    schema: `
      CREATE TABLE order_products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`
  },
  {
    name: 'payments',
    schema: `
      CREATE TABLE payments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        method_id INTEGER NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id),
        FOREIGN KEY (method_id) REFERENCES payment_methods(id)
      )`
  },
  {
    name: 'payment_methods',
    schema: `
      CREATE TABLE payment_methods (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
  },
  {
    name: 'personal_addresses',
    schema: `
      CREATE TABLE personal_addresses (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        address_id INTEGER NOT NULL,
        type VARCHAR(50) NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (address_id) REFERENCES address(id)
      )`
  },
  {
    name: 'products',
    schema: `
      CREATE TABLE products (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        price DECIMAL(10,2) NOT NULL,
        stock INTEGER NOT NULL,
        brand_id INTEGER,
        category_id INTEGER,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (brand_id) REFERENCES brands(id),
        FOREIGN KEY (category_id) REFERENCES categories(id)
      )`
  },
  {
    name: 'product_in_carts',
    schema: `
      CREATE TABLE product_in_carts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id INTEGER NOT NULL,
        shopping_cart_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (product_id) REFERENCES products(id),
        FOREIGN KEY (shopping_cart_id) REFERENCES shopping_carts(id)
      )`
  },
  {
    name: 'purchases',
    schema: `
      CREATE TABLE purchases (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        total DECIMAL(10,2) NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`
  },
  {
    name: 'ratings',
    schema: `
      CREATE TABLE ratings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        rating INTEGER NOT NULL,
        comment TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`
  },
  {
    name: 'reviews',
    schema: `
      CREATE TABLE reviews (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        product_id INTEGER NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        rating INTEGER NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id),
        FOREIGN KEY (product_id) REFERENCES products(id)
      )`
  },
  {
    name: 'shippings',
    schema: `
      CREATE TABLE shippings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        order_id INTEGER NOT NULL,
        method VARCHAR(255) NOT NULL,
        cost DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) NOT NULL,
        tracking_number VARCHAR(255),
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (order_id) REFERENCES orders(id)
      )`
  },
  {
    name: 'shipping_states',
    schema: `
      CREATE TABLE shipping_states (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
  },
  {
    name: 'shopping_carts',
    schema: `
      CREATE TABLE shopping_carts (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        customer_id INTEGER NOT NULL,
        status VARCHAR(50) NOT NULL,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL,
        FOREIGN KEY (customer_id) REFERENCES customers(id)
      )`
  },
  {
    name: 'sizes',
    schema: `
      CREATE TABLE sizes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name VARCHAR(255) NOT NULL,
        description TEXT,
        created_at DATETIME NOT NULL,
        updated_at DATETIME NOT NULL
      )`
  }
];

// Crear las tablas en orden
async function createTables() {
  try {
    await new Promise((resolve, reject) => {
      db.serialize(() => {
        TABLES.forEach(table => {
          db.run(table.schema, function(err) {
            if (err) {
              console.error(`Error creating table ${table.name}:`, err);
              reject(err);
            } else {
              console.log(`Created table ${table.name}`);
            }
          });
        });
        resolve();
      });
    });

    // Cerrar la conexión
    db.close();
    console.log('All tables created successfully');
  } catch (error) {
    console.error('Error creating tables:', error);
    process.exit(1);
  }
}

// Ejecutar la creación de tablas
createTables();
process.on('SIGINT', () => {
  db.close();
  process.exit(0);
});
