# ---- Build stage ----
FROM node:20-alpine AS build

# Installez pnpm (ou utilisez npm/yarn si vous préférez)
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copie des manifests d'abord pour optimiser le cache
COPY package.json pnpm-lock.yaml* ./

# Installe les deps de prod + build
RUN pnpm install --frozen-lockfile

# Copie du reste du code
COPY . .

# Build Nuxt (Nitro node-server par défaut en prod)
# Si vous avez un preset spécifique, adaptez: NITRO_PRESET=cloudflare, etc.
ENV NODE_ENV=production
RUN pnpm build

# ---- Runtime stage ----
FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
# Le port Nitro par défaut
ENV PORT=3000
# Si vous utilisez NITRO_PORT/NITRO_HOST, vous pouvez les définir ici:
# ENV NITRO_PORT=3000
# ENV NITRO_HOST=0.0.0.0

# Copie des sorties de build uniquement
COPY --from=build /app/.output ./.output

# Healthcheck basique (ajustez l'URL si vous avez une route health)
HEALTHCHECK --interval=30s --timeout=3s --retries=3 \
  CMD wget -qO- http://localhost:3000/ || exit 1

# Expose le port de l'app
EXPOSE 3000

# Les certs seront montés par docker-compose à /cert (lecture seule)
# Démarre le serveur Nitro
CMD ["node", ".output/server/index.mjs"]
