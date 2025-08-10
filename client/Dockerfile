# Client Dockerfile
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
COPY client ./client
COPY shared ./shared
COPY theme.json ./theme.json
COPY vite.config.ts ./vite.config.ts
COPY tsconfig.json ./tsconfig.json
COPY tailwind.config.ts ./tailwind.config.ts
COPY postcss.config.js ./postcss.config.js

# Build the client application only
# Set environment variable for build time
# ENV VITE_API_URL=https://ai-buddy.digitalvillage.network // luke fix this
ENV VITE_API_URL=http://localhost:3001
RUN npx vite build

# Production image, serve with a simple static server
FROM nginx:alpine AS runner
WORKDIR /app

# Copy built files
COPY --from=builder /app/dist/public /usr/share/nginx/html

# Create nginx config for SPA with API proxy
RUN echo 'server { \
    listen 3001; \
    server_name localhost; \
    root /usr/share/nginx/html; \
    index index.html; \
    \
    # Proxy API requests to server container \
    location /api/ { \
        proxy_pass http://server:4001; \
        proxy_http_version 1.1; \
        proxy_set_header Upgrade $http_upgrade; \
        proxy_set_header Connection "upgrade"; \
        proxy_set_header Host $host; \
        proxy_set_header X-Real-IP $remote_addr; \
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for; \
        proxy_set_header X-Forwarded-Proto $scheme; \
        proxy_cache_bypass $http_upgrade; \
    } \
    \
    # Serve static files for everything else \
    location / { \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 3001

CMD ["nginx", "-g", "daemon off;"]
