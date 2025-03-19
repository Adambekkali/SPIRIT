# Configuration du projet :

Vous venez de git pull ? Suivez les étapes suivantes

1. Assurez-vous d'avoir Docker Desktop installé sur votre machine et lancez le

2. Assurez-vous de fermer les conteneurs en cours :
   ```bash
   docker-compose down
   ```

3. Lancez les conteneurs avec la commande :
   ```bash
   docker-compose up -d
   ```
4. Les services devraient maintenant être accessibles :
   - Frontend : http://localhost:3000
   - Backend : http://localhost:3000/api
   - Base de données : localhost:5432

5. Pour arrêter les conteneurs :
   ```bash
   docker-compose down
   ```
