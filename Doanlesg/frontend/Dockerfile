# Stage 1: Build the React application
FROM node:22-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Serve the application with Caddy
FROM caddy:2-alpine
WORKDIR /srv
COPY --from=build /app/build .
COPY Caddyfile /etc/caddy/Caddyfile