FROM node:18-alpine

WORKDIR /app

# Copie des fichiers de configuration
COPY package.json package-lock.json* ./

# Installation des dépendances
RUN npm ci

# Copie du code source
COPY . .

# Exposition du port
EXPOSE 5000

# Commande de démarrage avec nodemon pour le développement
CMD ["npm", "run", "dev"]