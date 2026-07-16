FROM node:20-alpine

WORKDIR /workspace

# Copy dependency configuration files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy source code
COPY . .

# Expose Vite default dev port
EXPOSE 5173

# Start Vite dev server exposing the host to accept connections from outside the container
CMD ["npm", "run", "dev", "--", "--host"]
