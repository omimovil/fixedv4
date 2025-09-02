# Usar la misma imagen base que en el build exitoso
FROM --platform=linux/amd64 node:18-bullseye AS builder

# Instalar yarn globalmente
RUN npm install -g yarn

WORKDIR /app

# Instalar dependencias necesarias para compilaciones nativas
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar solo los archivos necesarios para instalar dependencias
COPY package*.json ./

# Usar yarn para instalar dependencias (como en el build exitoso)
RUN yarn install --frozen-lockfile

# Limpiar caché para reducir el tamaño de la imagen
RUN npm cache clean --force

# Copiar el resto de archivos necesarios para el build
COPY . .

# Asegurar que los permisos sean correctos
RUN chown -R node:node /app

# Crear directorio para la base de datos y asegurar permisos correctos
RUN mkdir -p .tmp && chmod -R 755 .tmp

# Configurar variables de entorno para el build
ENV NODE_ENV=production
ENV NODE_OPTIONS="--max-old-space-size=4096 --openssl-legacy-provider"

# Deshabilitar características experimentales de Strapi
ENV STRAPI_DISABLE_ESBUILD=true
ENV STRAPI_DISABLE_EXPERIMENTAL_FEATURES=true
ENV STRAPI_DISABLE_ADMIN_REBUILD=true
ENV STRAPI_TELEMETRY_DISABLED=true

# Configuración de npm
ENV NPM_CONFIG_FUND=false
ENV NPM_CONFIG_AUDIT=false
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENV NPM_CONFIG_PROGRESS=false

# Otras optimizaciones
ENV NEXT_TELEMETRY_DISABLED=1
ENV DISABLE_EXPERIMENTAL_COREPACK=true

# Compilar la aplicación con una estrategia que evite problemas con SWC
# Ejecutar el build con yarn (como en el build exitoso)
RUN yarn run build

# Segunda etapa para la imagen final
FROM --platform=linux/amd64 node:18-bullseye

# Instalar yarn globalmente
RUN npm install -g yarn

WORKDIR /app

# Instalar solo dependencias necesarias para producción
RUN apt-get update && apt-get install -y \
    python3 \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Copiar archivos de dependencias
COPY package*.json ./

# Instalar solo dependencias de producción con yarn
RUN yarn install --production --frozen-lockfile

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
CMD ["yarn", "start"]
