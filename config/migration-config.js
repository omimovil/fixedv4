module.exports = {
  // Configuración de la migración
  migration: {
    // Tablas a migrar
    tables: {
      core: [
        'strapi_users',
        'strapi_roles',
        'strapi_permissions',
        'strapi_webhooks',
        'strapi_files',
        'strapi_file_morph'
      ],
      content: [
        'address',
        'available_categories',
        'brands',
        'categories',
        'colors',
        'contact_addresses',
        'cookies',
        'cookie_categories',
        'cookie_popups',
        'customers',
        'countries',
        'delivery_dates',
        'favorite_products',
        'orders',
        'order_products',
        'payments',
        'payment_methods',
        'personal_addresses',
        'products',
        'product_in_carts',
        'purchases',
        'ratings',
        'reviews',
        'shippings',
        'shipping_states',
        'shopping_carts',
        'sizes'
      ]
    },
    // Tablas con relaciones especiales
    relationships: {
      'orders': ['order_products'],
      'products': ['product_in_carts', 'favorite_products', 'ratings', 'reviews'],
      'customers': ['favorite_products', 'orders', 'shopping_carts']
    },
    // Tablas que deben migrarse en orden específico
    order: [
      'strapi_users',
      'strapi_roles',
      'strapi_permissions',
      'countries',
      'categories',
      'brands',
      'products',
      'customers',
      'orders',
      'shopping_carts'
    ]
  },
  // Configuración de verificación
  verification: {
    batchSize: 100,
    retries: 3,
    timeout: 30000
  },
  // Configuración de logs
  logging: {
    level: 'info',
    file: 'migration.log'
  }
};
