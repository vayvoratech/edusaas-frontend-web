# syntax=docker/dockerfile:1

# ---- Build stage ----
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm ci

# Build arguments for React frontend compilation
ARG REACT_APP_API_BASE=/api
ARG REACT_APP_CLERK_PUBLISHABLE_KEY=pk_test_aW5jbHVkZWQtYmx1ZWdpbGwtNTI1MS5jbGVyay5hY2NvdW50cy5kZXYk

ENV REACT_APP_API_BASE=$REACT_APP_API_BASE
ENV REACT_APP_CLERK_PUBLISHABLE_KEY=$REACT_APP_CLERK_PUBLISHABLE_KEY

COPY . .
RUN npm run build

# ---- Runtime stage ----
FROM nginx:1.27-alpine AS runtime
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/build /usr/share/nginx/html

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]