FROM node:20-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and install dependencies
COPY package*.json ./
RUN npm ci --only=production

# Copy application source code
COPY . .

# Expose the API port
EXPOSE 8085

# Start the application
CMD ["node", "server.js"]
