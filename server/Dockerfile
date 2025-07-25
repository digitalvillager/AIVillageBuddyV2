# Server Dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY package.json package-lock.json* ./

# Copy necessary files for build
COPY server ./server
COPY shared ./shared
COPY tsconfig.json ./tsconfig.json
COPY drizzle.config.ts ./drizzle.config.ts
COPY vite.config.ts ./vite.config.ts

# Build the server application only
RUN npx esbuild server/index.ts --platform=node --packages=external --bundle --format=esm --outdir=dist

# Production image, copy all the files and run the application
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 express

# Copy the built application
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/package.json ./package.json

# Copy production dependencies only
COPY --from=deps /app/node_modules ./node_modules

# Copy migrations and startup scripts
COPY --from=builder /app/server/migrations ./migrations
COPY --from=builder /app/server/init-db.sh ./init-db.sh
COPY --from=builder /app/server/start.sh ./start.sh

# Install PostgreSQL client for migrations
USER root
RUN apk add --no-cache postgresql-client
RUN chmod +x ./init-db.sh ./start.sh

USER express

EXPOSE 4000

ENV PORT=4000

CMD ["./start.sh"]