FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Crear directorio para la base de datos
RUN mkdir -p .tmp

# Intentar copiar la base de datos SQLite solo si existe
COPY .tmp/data.db* .tmp/ 2>/dev/null || true

EXPOSE 1337

CMD ["npm", "run", "start"]
