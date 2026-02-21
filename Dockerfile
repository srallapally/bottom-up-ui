# syntax=docker/dockerfile:1

########## BUILD STAGE ##########
FROM node:20-slim AS build
WORKDIR /app

# Install root (server) deps
COPY package.json package-lock.json ./
RUN npm ci

# Install client deps
COPY client/package.json client/package-lock.json ./client/
RUN cd client && npm ci

# Copy source
COPY client ./client
COPY server ./server

# Build Vue app
RUN cd client && npm run build

########## RUNTIME STAGE ##########
FROM node:20-slim
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080

# Install only production deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# Copy server
COPY server ./server

# Copy built client assets
COPY --from=build /app/client/dist ./server/client-dist

EXPOSE 8080
CMD ["node", "server/server.js"]