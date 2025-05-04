module.exports = {
  // Configuración de Railway
  railway: {
    // Esta configuración se actualizará automáticamente cuando se despliegue en Railway
    database: {
      name: process.env.RAILWAY_PROJECT_NAME || 'mi-proyecto',
      region: process.env.RAILWAY_REGION || 'us-central1',
      instance: process.env.RAILWAY_POSTGRES_INSTANCE || 'main'
    }
  }
};
