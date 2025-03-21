FROM node:18-alpine

WORKDIR /app

# Installation des dépendances pendant la construction
COPY package.json package-lock.json* ./
RUN npm ci

# Copie du reste des fichiers
COPY . .

# Exposition des ports
EXPOSE 3000 5555

# La commande de démarrage qui attend PostgreSQL et initialise la base de données
CMD sh -c "echo 'Attente de PostgreSQL...' && sleep 5 && npx prisma generate && npx prisma db push && npx prisma db seed && npm run dev"