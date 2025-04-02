# Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Installation des dépendances
COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci
RUN npx prisma generate  # On le fait au build

# Build stage pour la production
FROM node:18-alpine AS production

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 3000 5555

CMD npx prisma db push && npx prisma db seed && npm run start

# Development stage
FROM node:18-alpine AS development

WORKDIR /app
COPY --from=builder /app/node_modules ./node_modules
COPY . .

EXPOSE 3000 5555

CMD npx prisma db push && npx prisma db seed && npm run dev