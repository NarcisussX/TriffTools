FROM node:20-alpine AS builder-stage

# WORKDIR /app
# COPY ./sde /app/sde
# FRONTEND
COPY frontend/package*.json ./frontend/
WORKDIR /app/frontend
RUN npm install
COPY frontend ./
RUN npm run build

# BACKEND
WORKDIR /app
COPY backend ./backend

WORKDIR /app/backend
RUN npm install

# FINAL STAGE
FROM node:20-alpine
WORKDIR /app

COPY --from=builder-stage /app/frontend/dist ./frontend/dist
COPY --from=builder-stage /app/backend ./backend

WORKDIR /app
EXPOSE 3000
CMD ["node", "backend/index.js"]