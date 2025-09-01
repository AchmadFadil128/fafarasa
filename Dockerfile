# Gunakan image Node.js LTS
FROM node:20-alpine AS builder
WORKDIR /app

# System deps untuk Prisma (dan umum)
RUN apk add --no-cache libc6-compat openssl

COPY package*.json ./
RUN npm ci

# Generate Prisma Client (builder)
COPY prisma ./prisma
RUN npx prisma generate

# Copy source dan build Next
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# System deps untuk Prisma runtime
RUN apk add --no-cache libc6-compat openssl

# Install dependencies for production
COPY --from=builder /app/package*.json ./
RUN npm ci --only=production \
  && npm i prisma --no-save

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/health-check.js ./

# Generate Prisma client in production (platform-specific)
RUN npx prisma generate

# Create a startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Waiting for database to be ready..."' >> /app/start.sh && \
    echo 'npx prisma migrate deploy' >> /app/start.sh && \
    echo 'echo "Running health check..."' >> /app/start.sh && \
    echo 'node health-check.js' >> /app/start.sh && \
    echo 'echo "Starting application..."' >> /app/start.sh && \
    echo 'npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 3000
CMD ["/app/start.sh"] 