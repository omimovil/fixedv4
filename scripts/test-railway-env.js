const dotenv = require('dotenv');

// Simular el entorno de Railway
process.env.RAILWAY = 'true';

// Cargar variables de entorno desde el archivo de ejemplo
dotenv.config({ path: './railway.env.example' });

// Mostrar cómo las variables se manejan
console.log('=== Variables de Entorno ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL);
console.log('RAILWAY:', process.env.RAILWAY);
console.log('NODE_ENV:', process.env.NODE_ENV);

// Notar que no mostramos la contraseña real
console.log('\n=== Seguridad ===');
console.log('Las contraseñas y credenciales no se mostrarán en el panel de Railway');
console.log('El script solo ve las variables de entorno, pero no puede acceder a los valores reales');
