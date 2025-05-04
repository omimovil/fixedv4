const fs = require('fs');
const path = require('path');

function createLogger(level = 'info', logFile = 'migration.log') {
  const logLevels = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3
  };

  const currentLevel = logLevels[level] || logLevels.info;

  const logPath = path.join(__dirname, logFile);
  
  // Crear el archivo de log si no existe
  if (!fs.existsSync(logPath)) {
    fs.writeFileSync(logPath, '');
  }

  function log(message, level = 'info') {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] [${level.toUpperCase()}] ${message}\n`;
    
    // Escribir en el archivo
    fs.appendFileSync(logPath, logEntry);
    
    // Mostrar en consola si es info o superior
    if (logLevels[level] <= currentLevel) {
      console[level](logEntry);
    }
  }

  return {
    debug: (message) => log(message, 'debug'),
    info: (message) => log(message, 'info'),
    warn: (message) => log(message, 'warn'),
    error: (message) => log(message, 'error')
  };
}

module.exports = {
  createLogger
};
