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

# Instalar una versión específica de @swc/core que sea compatible
RUN npm install @swc/core@1.3.98

# Instalar todas las dependencias (incluyendo devDependencies)
RUN npm install

# Copiar el resto de archivos
COPY . .

# Crear directorio para la base de datos y asegurar permisos correctos
RUN mkdir -p .tmp && chmod -R 755 .tmp

# Configurar variables de entorno para evitar problemas con SWC
ENV NODE_OPTIONS="--max-old-space-size=8192 --openssl-legacy-provider"
ENV STRAPI_DISABLE_EXPERIMENTAL_FEATURES="true"
ENV STRAPI_DISABLE_ADMIN_REBUILD="true"
ENV STRAPI_TELEMETRY_DISABLED="true"
ENV DISABLE_EXPERIMENTAL_COREPACK="true"
ENV NODE_ENV="production"
# Forzar el uso de Babel en lugar de SWC
ENV STRAPI_DISABLE_ESBUILD="true"
# Deshabilitar completamente SWC
ENV NODE_OPTIONS="--max-old-space-size=8192 --openssl-legacy-provider"
ENV NODE_ENV=production
ENV STRAPI_DISABLE_ESBUILD=true
ENV STRAPI_DISABLE_EXPERIMENTAL_FEATURES=true
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_PROGRESS=false
ENV NEXT_TELEMETRY_DISABLED=1

# Compilar la aplicación con una estrategia que evite problemas con SWC
RUN npm run build -- --debug || \
    (echo "Primer intento de build falló, intentando sin admin rebuild" && \
     STRAPI_DISABLE_ADMIN_REBUILD=true npm run build -- --debug) || \
    (echo "Segundo intento de build falló, intentando con opciones adicionales" && \
     NODE_OPTIONS="--max-old-space-size=8192 --openssl-legacy-provider" \
     NODE_ENV=production \
     STRAPI_DISABLE_ESBUILD=true \
     npm run build -- --debug)

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
# Forzar el uso de Babel en producción
ENV STRAPI_DISABLE_ESBUILD="true"

EXPOSE 1337

# Usar el comando start para producción
CMD ["npm", "run", "start"]
