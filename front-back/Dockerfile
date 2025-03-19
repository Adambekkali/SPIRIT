FROM node:18-alpine

WORKDIR /app

# Installation des dépendances pendant la construction
COPY package.json package-lock.json* ./
RUN npm ci

# Copie du reste des fichiers
COPY . .

# Génération du client Prisma pendant la construction
# (cette partie ne dépend pas de la base de données)
RUN npx prisma generate

# Exposition des ports
EXPOSE 3000 5555

# La commande de démarrage qui attend PostgreSQL et initialise la base de données
CMD sh -c "echo 'Attente de PostgreSQL...' && sleep 5 && npx prisma db push && npx prisma db seed && npm run dev"