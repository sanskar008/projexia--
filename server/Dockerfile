# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* bun.lockb* ./
RUN if [ -f package-lock.json ]; then npm ci; elif [ -f bun.lockb ]; then npm install -g bun && bun install; else npm install; fi

# Copy the rest of the backend code
COPY . .

# Expose the port (change if your server uses a different port)
EXPOSE 3000

# Set ESBuild binary path
ENV ESBUILD_BINARY_PATH=/usr/local/bin/esbuild

# Start the server (change to your actual entry point if different)
CMD ["node", "prod-server.js"]
