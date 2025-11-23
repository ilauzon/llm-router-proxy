# Official Node environment (Alpine: smaller/faster)
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files and install dependencies (caches dependency installation)
COPY package*.json ./

# Install dependencies
# The RUN keyword happens when we are building the image
RUN npm install 

# Copy the rest of the application code
COPY . .

# Set PORT environment variable
ENV PORT=8111

# Expose the port the app runs on
EXPOSE 8111

# Start the application
# Use "npm start" or the appropriate command defined in package.json
# CMD keyword used to run the container AFTER building.
# You can only have one CMD instruction in a Dockerfile.
CMD ["npm", "run", "docker"]