# ----------------------------- base -----------------------------
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache openssl libc6-compat

# -------------------------- development -------------------------
FROM base AS development
COPY package*.json ./
RUN npm install
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
EXPOSE 4000
CMD ["npm", "run", "start:dev"]

# ---------------------------- builder ---------------------------
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build && npm prune --omit=dev

# --------------------------- production -------------------------
FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package.json ./package.json
EXPOSE 4000
# Aplica las migraciones pendientes antes de levantar la API.
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/src/main"]