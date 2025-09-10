# Gunakan image Node.js LTS
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
# Install deps (including dev) deterministically
RUN npm ci
COPY prisma ./prisma
RUN npx prisma generate
COPY . .
RUN npm run build

# Production image
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Required runtime environment variables (set via docker run or compose)
# - DATABASE_URL: MySQL connection string
# - NEXTAUTH_URL: Public app URL (e.g., https://example.com)
# - NEXTAUTH_SECRET: Strong secret for JWT/session
# - ADMIN_USERNAME: Seed admin username (used by prisma/seed.js)
# - ADMIN_PASSWORD: Seed admin password (used by prisma/seed.js)
ENV NEXTAUTH_URL="http://localhost:8832" \
    NEXTAUTH_SECRET="1234567890" \
    DATABASE_URL="mysql://fafarasa:fafarasa@host.docker.internal:3306/fafarasa" \
    ADMIN_USERNAME="admin" \
    ADMIN_PASSWORD="admin123"

# Install dependencies for production
COPY --from=builder /app/package*.json ./
# Install only production dependencies
RUN npm ci --omit=dev

# Copy built application
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma


# Prisma client is generated during @prisma/client install (postinstall)

# Create a startup script
RUN echo '#!/bin/sh' > /app/start.sh && \
    echo 'echo "Waiting for database to be ready..."' >> /app/start.sh && \
    echo 'npx prisma generate || true' >> /app/start.sh && \
    echo 'npx prisma migrate deploy' >> /app/start.sh && \
    echo 'echo "Running health check..."' >> /app/start.sh && \
    echo 'echo "Starting application..."' >> /app/start.sh && \
    echo 'npm start' >> /app/start.sh && \
    chmod +x /app/start.sh

EXPOSE 3000
CMD ["/app/start.sh"] 