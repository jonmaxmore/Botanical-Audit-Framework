# Farmer Portal - Production Dockerfile
# Multi-stage build for optimal image size

# Stage 1: Dependencies
FROM node:18-alpine AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# Install pnpm
RUN npm install -g pnpm@8

# Copy package files
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/farmer-portal/package.json ./apps/farmer-portal/
COPY packages ./packages

# Install dependencies
RUN pnpm install --frozen-lockfile --prefer-offline

# Stage 2: Builder
FROM node:18-alpine AS builder
WORKDIR /app

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/farmer-portal/node_modules ./apps/farmer-portal/node_modules

# Copy source code
COPY . .

# Set environment
ENV NEXT_TELEMETRY_DISABLED 1
ENV NODE_ENV production

# Build the application
WORKDIR /app/apps/farmer-portal
RUN npm run build

# Stage 3: Runner
FROM node:18-alpine AS runner
WORKDIR /app

# Install dumb-init for proper signal handling
RUN apk add --no-cache dumb-init curl

# Create non-root user
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Set environment
ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1
ENV PORT 3001

# Copy built application
COPY --from=builder /app/apps/farmer-portal/public ./public
COPY --from=builder /app/apps/farmer-portal/.next/standalone ./
COPY --from=builder /app/apps/farmer-portal/.next/static ./.next/static

# Set permissions
RUN chown -R nextjs:nodejs /app

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3001

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3001/api/health || exit 1

# Start application
ENTRYPOINT ["dumb-init", "--"]
CMD ["node", "server.js"]
