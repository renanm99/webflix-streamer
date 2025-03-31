# Base on Node 20 (LTS)
FROM node:20-alpine

# Install pnpm (specific version from package.json)
RUN npm install -g pnpm@9.15.4

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install dependencies with frozen lockfile for production reliability
RUN pnpm install

# Copy the rest of the application
COPY . .

# Set environment variables
#ENV NODE_ENV=production
ENV PORT=9000

# Create a .env file with required variables
RUN echo "NEXT_PUBLIC_URL_PATH=https://image.tmdb.org/t/p/w500" > .env

# Build the application
RUN pnpm build

# Start the application
CMD ["pnpm", "dev"]