# ========================
# Dockerfile - EPT Connect Backend
# ========================

# === STAGE 1 : Build ===
FROM node:20-alpine AS builder
WORKDIR /app

# Copie package.json + lock (pour profiter du cache Docker)
COPY package*.json ./
RUN npm ci --only=production

# Copie tout le code source
COPY . .

# === STAGE 2 : Production (image finale légère) ===
FROM node:20-alpine
WORKDIR /app

# Variables d'environnement (sécurité)
ENV NODE_ENV=production
ENV PORT=5000

# Copie uniquement ce qui est nécessaire depuis le builder
COPY --from=builder /app .

# Exposition du port
EXPOSE 5000

# Healthcheck pour Portainer / Docker
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/ || exit 1

# Démarrage
CMD ["node", "src/index.js"]