-# Usar una imagen base más ligera con soporte multi-architectura
FROM --platform=linux/amd64 node:18-alpine AS builder

WORKDIR /app

# Instalar dependencias necesarias para compilaciones nativas
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    gcc \
    libc-dev \
    postgresql-dev

# Configurar npm para mejor rendimiento
RUN npm config set update-notifier false \
    && npm config set fund false \
    && npm config set audit false

# Copiar solo los archivos necesarios para instalar dependencias
COPY package*.json ./

# Instalar dependencias de producción primero
RUN npm ci --only=production --prefer-offline --no-audit --progress=false

# Instalar dependencias de desarrollo
RUN npm ci --include=dev --prefer-offline --no-audit --progress=false

# Instalar una versión específica de @swc/core que sea compatible
RUN npm install @swc/core@1.3.92 --save-exact --no-package-lock --no-save

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
RUN npm run build -- --debug || \
    (echo "Primer intento de build falló, intentando sin admin rebuild" && \
     STRAPI_DISABLE_ADMIN_REBUILD=true npm run build -- --debug) || \
    (echo "Segundo intento de build falló, intentando con opciones adicionales" && \
     NODE_OPTIONS="--max-old-space-size=8192 --openssl-legacy-provider" \
     NODE_ENV=production \
     STRAPI_DISABLE_ESBUILD=true \
     npm run build -- --debug)

# Segunda etapa para la imagen final (más ligera)
FROM --platform=linux/amd64 node:18-alpine

WORKDIR /app

# Instalar solo dependencias necesarias para producción
RUN apk add --no-cache postgresql-client

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
