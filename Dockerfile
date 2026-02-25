# ─── Stage 1: Builder ────────────────────────────────────────────
FROM node:22-alpine AS builder
WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm ci

# Copy source
COPY . .

# Prisma generate only needs the schema, not a real DB connection
# Provide dummy URLs so prisma.config.ts doesn't fail
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DIRECT_URL="postgresql://dummy:dummy@localhost:5432/dummy"

RUN npx prisma generate
RUN npm run build

# ─── Stage 2: Runner ─────────────────────────────────────────────
FROM node:22-alpine AS runner
WORKDIR /app

# Install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy build artifacts
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/src/generated ./src/generated
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/prisma.config.ts ./prisma.config.ts

# Copy entrypoint script
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Prisma CLI is needed for migrate deploy at runtime
ENV DATABASE_URL="postgresql://dummy:dummy@localhost:5432/dummy"
ENV DIRECT_URL="postgresql://dummy:dummy@localhost:5432/dummy"
RUN npx prisma generate

# Clear dummy env vars — real values come from Coolify env config
ENV DATABASE_URL=""
ENV DIRECT_URL=""

EXPOSE 3333

ENTRYPOINT ["./docker-entrypoint.sh"]
