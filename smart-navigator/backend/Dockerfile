FROM node:18-alpine

# Security: Run as non-root user
RUN addgroup -g 1001 -S nodejs && \
    adduser -S backend -u 1001 -G nodejs

# Security: Update packages
RUN apk update && apk upgrade && apk add --no-cache dumb-init

WORKDIR /app

# Copy package files with correct ownership
COPY --chown=backend:nodejs package*.json ./

# Install dependencies
RUN npm ci --only=production && npm cache clean --force

# Copy source code with correct ownership
COPY --chown=backend:nodejs . .

# Create uploads directory with correct permissions
RUN mkdir -p uploads && chown backend:nodejs uploads

# Switch to non-root user
USER backend

# Security: Use dumb-init for proper signal handling
ENTRYPOINT ["dumb-init", "--"]

EXPOSE 5000

CMD ["npm", "start"]
