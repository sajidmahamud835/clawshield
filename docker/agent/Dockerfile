# Base: Alpine Linux + Node.js 20
FROM node:20-alpine

# Install minimal OS dependencies including curl for health checks
RUN apk add --no-cache curl

# Create non-root user 'claw' for security
RUN addgroup -S claw && adduser -S claw -G claw

# Set up application directory and memory mount permissions
WORKDIR /app
RUN mkdir -p /app/memory && chown -R claw:claw /app

# Switch to non-root user
USER claw

# In a full build, we'd copy package.json and install deps here
# COPY --chown=claw:claw package.json pnpm-lock.yaml* ./
# RUN corepack enable pnpm && pnpm install

# Health check (matches docker-compose.yml)
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:4000/health || exit 1

# Default command placeholder for agent-core wrapper
CMD ["sh", "-c", "echo 'Agent Core standing by...' && sleep infinity"]
