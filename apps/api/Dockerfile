# Build Stage
FROM node:22.14.0-alpine AS builder

# Set working directory
WORKDIR /app

# Create non-root user and group
RUN addgroup -S socio-manager && adduser -S socio-manager -G socio-manager

# Set ownership and permissions
RUN chown -R socio-manager:socio-manager /app

USER socio-manager

# Copy package files
COPY --chown=socio-manager:socio-manager package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY --chown=socio-manager:socio-manager . .

# Build the application
RUN npm run build

# Production Stage
FROM node:22.14.0-alpine

# Set working directory
WORKDIR /app

# Create non-root user and group
RUN addgroup -S socio-manager && adduser -S socio-manager -G socio-manager

# Set ownership and permissions
RUN chown -R socio-manager:socio-manager /app

USER socio-manager

# Copy built files from builder stage (only contents, not dist folder itself)
COPY --from=builder --chown=socio-manager:socio-manager /app/dist/ /app/

COPY --from=builder --chown=socio-manager:socio-manager /app/private /app/private
COPY --from=builder --chown=socio-manager:socio-manager /app/public /app/public

# Set environment variables
ENV NODE_ENV=production

# Expose default port (but allow overriding at runtime)
EXPOSE 5000

# Start the application with dynamic port support
CMD ["sh", "-c", "node /app/index.js"]