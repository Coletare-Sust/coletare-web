# ========================
# Build
# ========================
FROM node:26-alpine AS builder

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile

# NEXT_PUBLIC_* sao embutidas no bundle do navegador em tempo de build, entao precisam
# chegar aqui como build args (ex.: docker build --build-arg NEXT_PUBLIC_API_URL=...).
# Nao passe segredos: tudo que comeca com NEXT_PUBLIC_ fica publico no JavaScript.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=$NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
ENV NEXT_TELEMETRY_DISABLED=1

COPY . .
RUN yarn build

# ========================
# Runtime
# ========================
FROM node:26-alpine AS runner

WORKDIR /app
ENV NODE_ENV=production

# Copia apenas o standalone
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

EXPOSE 3000

CMD ["node", "server.js"]
