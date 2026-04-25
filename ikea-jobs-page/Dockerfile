# Stage 1 — build
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
ARG REACT_APP_JOBS_SERVER_URL
ARG REACT_APP_EMAIL_SERVICE_URL
ARG PUBLIC_URL
ENV REACT_APP_JOBS_SERVER_URL=$REACT_APP_JOBS_SERVER_URL
ENV REACT_APP_EMAIL_SERVICE_URL=$REACT_APP_EMAIL_SERVICE_URL
ENV PUBLIC_URL=$PUBLIC_URL
RUN npm run build

# Stage 2 — serve
FROM nginx:alpine
COPY --from=builder /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
