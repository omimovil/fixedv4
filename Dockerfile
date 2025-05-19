FROM node:18-bullseye AS builder

WORKDIR /app

# Instalar dependencias necesarias para compilaciones nativas y PostgreSQL
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm install

# Copiar el resto de archivos
COPY . .

# Crear directorio para la base de datos y asegurar permisos correctos
RUN mkdir -p .tmp && chmod -R 755 .tmp

# Configurar variables de entorno para el build
ENV NODE_ENV=production
ENV STRAPI_TELEMETRY_DISABLED=true
ENV NODE_OPTIONS="--max-old-space-size=8192"

# Instalar @swc/core de manera global para evitar problemas con los bindings
RUN npm install -g @swc/core @swc/cli

# Compilar la aplicación
RUN NODE_ENV=production npm run build

# Segunda etapa para la imagen final
FROM node:18-bullseye-slim

WORKDIR /app

# Instalar dependencias necesarias para ejecución y PostgreSQL
RUN apt-get update && apt-get install -y \
    python3 \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción
RUN npm install --production

# Copiar archivos construidos desde la etapa anterior
COPY --from=builder /app/build ./build
COPY --from=builder /app/config ./config
COPY --from=builder /app/public ./public
COPY --from=builder /app/src ./src
COPY --from=builder /app/scripts ./scripts
COPY --from=builder /app/.tmp ./.tmp
COPY --from=builder /app/railway.toml ./railway.toml

# Mantener variables de entorno en la imagen final
ENV NODE_OPTIONS="--openssl-legacy-provider"
ENV NODE_ENV="production"
ENV STRAPI_TELEMETRY_DISABLED="true"
ENV DISABLE_EXPERIMENTAL_COREPACK="true"

EXPOSE 1337

# Usar el comando start para producción
CMD ["npm", "run", "start"]
