# Stage 1: Build base with standard Node.js image
FROM node:22-alpine AS base

# Install libc6-compat for Prisma to work correctly on Alpine
RUN apk add --no-cache libc6-compat

# Stage 2: Install dependencies
FROM base AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# Stage 3: Build the application
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client
# We provide dummy URLs for Prisma configuration validation during build
ARG DATABASE_URL="postgresql://user:password@localhost:5432/db"
ARG DIRECT_URL="postgresql://user:password@localhost:5432/db"
ENV DATABASE_URL=$DATABASE_URL
ENV DIRECT_URL=$DIRECT_URL
RUN npx prisma generate

# Build Next.js
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

# Stage 4: Production runner
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set correct permissions
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/prisma.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/node_modules ./node_modules
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Standalone output optimizes the image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
