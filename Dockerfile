# Base on Node 20 (LTS)
FROM node:20-alpine

# Install pnpm (specific version from package.json)
RUN npm install -g pnpm@9.15.4

# Set working directory
WORKDIR /app

# Copy package.json and other config files
COPY package.json ./

# First generate a lock file if it doesn't exist
RUN pnpm install --no-frozen-lockfile

# Copy the rest of the application
COPY . .

# Set environment variables
ENV NODE_ENV=production
ENV PORT=9000

# Create a .env file with required variables
RUN echo "NEXT_PUBLIC_URL_PATH=https://image.tmdb.org/t/p/w500" > .env

# Build the application
RUN pnpm build

# Expose the port the app will run on
EXPOSE 9000

# Start the application
CMD ["pnpm", "start"]