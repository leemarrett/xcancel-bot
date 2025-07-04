# Use Node.js 18 as the base image
FROM node:18

# Create app directory
WORKDIR /usr/src/app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code (excluding .env and other ignored files)
COPY app.js .
COPY test.js .
COPY README.md .

# Set environment variables
ENV NODE_ENV=production

# Start the application
CMD ["npm", "start"] 