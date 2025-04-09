# Build stage
FROM node:20-alpine AS builder

# Set working directory
WORKDIR /build

# Copy package files first (for better layer caching)
COPY package.json package-lock.json ./

# Install all dependencies (using npm ci for more reliable builds)
RUN npm ci

# Copy source code
COPY . .

# Build the application and find output directories
RUN npm run build && \
    echo "=== Directory structure after build ===" && \
    ls -la && \
    echo "=== Locating build artifacts ===" && \
    find . -type d | grep -E 'dist|build|out|.next'

# Production stage
FROM node:20-alpine AS runner

# Set working directory
WORKDIR /app

# Create non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 webflix

# Set production environment
ENV NODE_ENV=production
ENV PORT=9000

# Copy package files
COPY package.json package-lock.json ./

# Only install production dependencies
RUN npm ci --omit=dev

# Copy built application from builder stage - try different output paths
# Uncomment the correct one based on build output from previous stage
# Common React/Vue output
# COPY --from=builder /build/dist ./dist
# COPY --from=builder /build/build ./build
# COPY --from=builder /build/out ./out

# Next.js specific
# COPY --from=builder /build/.next ./.next
# COPY --from=builder /build/public ./public

# Copy all files (temporary solution until we determine correct paths)
COPY --from=builder /build/ ./

# Use non-root user
USER webflix

# Add healthcheck
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:$PORT/ || exit 1

# Expose port
EXPOSE 9000

# Start the application in production mode
CMD ["npm", "run", "start"]