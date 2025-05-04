FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Crear directorio para la base de datos
RUN mkdir -p .tmp

# Copiar la base de datos SQLite si existe
COPY .tmp/data.db .tmp/

EXPOSE 1337

CMD ["npm", "run", "start"]
