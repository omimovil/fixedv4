FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Crear directorio para la base de datos y asegurar permisos correctos
RUN mkdir -p .tmp && chmod -R 755 .tmp

# Construir la aplicación antes de iniciarla en producción
RUN npm run build

EXPOSE 1337

# Usar el comando start para producción
CMD ["npm", "run", "start"]
