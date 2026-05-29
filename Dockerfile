# ========================
# Build
# ========================
FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# ========================
# Runtime
# ========================
FROM node:20-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copia apenas o standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
