# Base: Alpine Linux + Node.js 20
FROM node:20-alpine

# Install curl for health checks
RUN apk add --no-cache curl

# Create non-root user 'gateway' for security
RUN addgroup -S gateway && adduser -S gateway -G gateway

# Set up application directory
WORKDIR /app
RUN chown -R gateway:gateway /app

# Switch to non-root user
USER gateway

# Expose the WebSocket proxy port
EXPOSE 4000

# Copy only the necessary files for building the gateway package
COPY --chown=gateway:gateway package.json pnpm-lock.yaml* pnpm-workspace.yaml ./
COPY --chown=gateway:gateway packages/gateway ./packages/gateway
COPY --chown=gateway:gateway packages/shared-types ./packages/shared-types

# Enable pnpm and build the workspace
# RUN corepack enable pnpm && pnpm install --filter=@clawshield/gateway && pnpm --filter=@clawshield/gateway build

# Health check (matches docker-compose.yml)
HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Default command placeholder for gateway server
CMD ["sh", "-c", "echo 'Gateway Proxy standing by...' && sleep infinity"]
