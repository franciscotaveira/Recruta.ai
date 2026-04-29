# Base image for building
FROM node:20-slim AS builder

WORKDIR /app

# Install dependencies (better-sqlite3 may need python/build-tools depending on arch, but slim usually works well with prebuilds or we can add them)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

# Copy package files
COPY package*.json ./
COPY server/package*.json ./server/

# Install root dependencies
RUN npm install

# Install server dependencies
RUN cd server && npm install

# Copy project files
COPY . .

# Build frontend
RUN npm run build

# Stage 2: Production runner
FROM node:20-slim

WORKDIR /app

RUN apt-get update && apt-get install -y curl tzdata && rm -rf /var/lib/apt/lists/*

# Define ENV vars
ENV NODE_ENV=production
ENV PORT=3456

# Add non-root user
RUN groupadd -r recruta && useradd -r -g recruta recruta

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Copy server files
COPY --from=builder /app/server ./server
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/node_modules ./node_modules

# Ensure data directory exists with correct permissions
RUN mkdir -p /app/server/storage/data && chown -R recruta:recruta /app

USER recruta

# Expose the API port
EXPOSE 3456

# Start the application directly (dist is already built)
# Start the application using npx tsx for reliable TypeScript resolution
CMD ["npx", "tsx", "server/index.ts"]
