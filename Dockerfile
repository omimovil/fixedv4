FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Crear directorio para la base de datos
RUN mkdir -p .tmp

# Intentar copiar la base de datos SQLite si existe
COPY .tmp/data.db* .tmp/ 2>/dev/null || echo 'No se encontró la base de datos SQLite, continuando...'

# Asegurar que el directorio de la base de datos tenga permisos correctos
RUN chmod -R 755 .tmp

EXPOSE 1337

CMD ["npm", "run", "start"]
