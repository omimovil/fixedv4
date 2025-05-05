FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Crear directorio para la base de datos
RUN mkdir -p .tmp

# Intentar copiar la base de datos SQLite si existe
# Nota: Simplificado para evitar problemas con la sintaxis de shell en Docker
COPY .tmp/data.db* .tmp/ 2>/dev/null || true

# Asegurar que el directorio de la base de datos tenga permisos correctos
RUN chmod -R 755 .tmp

EXPOSE 1337

CMD ["npm", "run", "start"]
