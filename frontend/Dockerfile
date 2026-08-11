# ----------------------------- base -----------------------------
FROM node:22-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

# -------------------------- development -------------------------
FROM base AS development
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "run", "dev"]

# ---------------------------- builder ---------------------------
FROM base AS builder
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# --------------------------- production -------------------------
FROM base AS production
ENV NODE_ENV=production
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json
EXPOSE 3000
CMD ["npm", "start"]
