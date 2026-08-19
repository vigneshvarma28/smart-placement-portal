# Step 1: Build the React frontend
FROM node:18-alpine AS frontend-builder
WORKDIR /app/client
COPY client/package*.json ./
RUN npm install
COPY client/ ./
RUN npm run build

# Step 2: Set up the production server
FROM node:18-alpine
WORKDIR /app

# Install server dependencies
COPY server/package*.json ./server/
WORKDIR /app/server
RUN npm install --omit=dev

# Copy server code
COPY server/ ./

# Copy built frontend assets
COPY --from=frontend-builder /app/client/build /app/client/build

# Set environment
ENV NODE_ENV=production
ENV PORT=5000

EXPOSE 5000

CMD ["node", "server.js"]
