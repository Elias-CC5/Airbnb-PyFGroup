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
# Intenta aplicar las migraciones pendientes, pero no bloquea el arranque si
# fallan. Neon suspende el compute por inactividad y, mientras despierta,
# `migrate deploy` abandona el advisory lock a los 10 s y devuelve error —
# aunque no hubiera ninguna migración que aplicar. Con `||` la API levanta
# igual y las migraciones se aplican a mano cuando toque:
#     DATABASE_URL="<url directa, sin -pooler>" npx prisma migrate deploy
CMD ["sh", "-c", "npx prisma migrate deploy || echo 'AVISO: migraciones no aplicadas, la API arranca igual'; node dist/src/main"]