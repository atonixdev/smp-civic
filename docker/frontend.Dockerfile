# Frontend Dockerfile for SMP Civic Platform
FROM node:18-alpine

# Set environment variables
ENV NODE_ENV=development \
    PATH=/app/node_modules/.bin:$PATH

# Install system dependencies
RUN apk add --no-cache \
    git \
    curl \
    && rm -rf /var/cache/apk/*

# Create app user
RUN addgroup -g 1001 -S appuser && \
    adduser -S appuser -u 1001

# Set work directory
WORKDIR /app

# Copy package files
COPY frontend/package*.json /app/

# Install dependencies
RUN npm ci --only=production=false && \
    npm cache clean --force

# Copy project files
COPY frontend/ /app/

# Change ownership
RUN chown -R appuser:appuser /app

# Switch to non-root user
USER appuser

# Expose port
EXPOSE 3000

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:3000 || exit 1

# Start the application
CMD ["npm", "start"]