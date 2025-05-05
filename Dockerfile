FROM node:18 AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm install

# Copiar el resto de archivos
COPY . .

# Crear directorio para la base de datos y asegurar permisos correctos
RUN mkdir -p .tmp && chmod -R 755 .tmp

# Construir la aplicación antes de iniciarla en producción
# Usar NODE_OPTIONS para evitar problemas con SWC
ENV NODE_OPTIONS=--openssl-legacy-provider
RUN npm run build

# Segunda etapa para la imagen final
FROM node:18

WORKDIR /app

# Copiar archivos de dependencias
COPY package*.json ./
RUN npm install --only=production

# Copiar archivos construidos desde la etapa anterior
COPY --from=builder /app/build ./build
COPY --from=builder /app/config ./config
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/.tmp ./.tmp
COPY --from=builder /app/railway.toml ./railway.toml

# Mantener la variable de entorno NODE_OPTIONS en la imagen final
ENV NODE_OPTIONS=--openssl-legacy-provider

EXPOSE 1337

# Usar el comando start para producción
CMD ["npm", "run", "start"]
