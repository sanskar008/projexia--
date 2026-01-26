# Use official Node.js LTS image
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies
COPY package.json package-lock.json* ./
RUN npm install

# Copy the rest of the backend code
COPY . .

# Build TypeScript
RUN npm run build

# Expose the port
EXPOSE 5000

# Start the server
CMD ["npm", "start"]
