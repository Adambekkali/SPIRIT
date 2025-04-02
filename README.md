# SPIRIT

__Début du projet :__ _17/03/2024_
__Avec :__
Diego Montorier  
Matheus Kops Guedes  
Abdelali Imzilen  
Adam Bekkali  
Maïlys Poulain

## Technologies

bd: postgresql  
back-end: Next  
Front-end: Next

## 🐳 Commandes Docker

### Environnement de Développement

```bash
# Démarrer l'environnement
docker-compose up -d

# Voir les logs
docker-compose logs -f

# Installer un nouveau package
docker-compose exec front-back npm install nom-du-package

# Arrêter l'environnement
docker-compose down
```

### Environnement de Test

```bash
# Démarrer les tests
docker-compose -f docker-compose.yml -f docker-compose.test.yml up -d

# Voir les logs des tests
docker-compose -f docker-compose.yml -f docker-compose.test.yml logs -f test-runner

# Arrêter l'environnement de test
docker-compose -f docker-compose.yml -f docker-compose.test.yml down
```

### Environnement de Production

```bash
# Configuration
# 1. Créer un fichier .env avec :
DB_USER=votre_user
DB_PASSWORD=votre_password
DB_NAME=votre_db

# 2. Démarrer en production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml up -d

# Voir les logs de production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml logs -f

# Arrêter l'environnement de production
docker-compose -f docker-compose.yml -f docker-compose.prod.yml down
```

### Commandes Utiles

```bash
# Reconstruire les images
docker-compose build

# Voir l'état des services
docker-compose ps

# Redémarrer un service spécifique
docker-compose restart service_name

# Voir les logs d'un service spécifique
docker-compose logs -f service_name

# Accéder à la base de données
docker-compose exec db psql -U postgres -d app_db
```

## Users stories

1. Authentification et Accès
2. Sélection du Concours
3. Gestion des Épreuves
4. Gestion des Couples dans une Épreuve
5. Suivi des Résultats
6. Gestion des Statuts des Épreuves

## 🏆 Tableau 1 : Compétitions, Épreuves et Couples

| 🏅 **Compétitions**       | 📋 **Épreuves**                                       | 🐴👤 **Couples (Cavalier & Cheval)**                                                      |
| ------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------- |
| 🔢 **Numéro**             | 🔢 **Numéro d'ordre**                                 | 👤 **Cavalier** : Nom, Prénom, Licence                                                    |
| 🏆 **Intitulé**           | 🏁 **Intitulé**                                       | 🐴 **Cheval** : Nom, Numéro de sire                                                       |
| 🎭 **Type** (CSO/Equifun) | 📌 **Statut** : A venir, En cours, Terminée, Clôturée | 🚦 **Statut du couple** : Partant, En piste, En bord de piste, Non Partant, Fini, Éliminé |

---

## 📊 Tableau 2 : Événements, Résultats et Rôles des Utilisateurs

| 🎟️ **Événements**        | 🏁 **Résultats**   | 🎭 **Rôles des Utilisateurs**                       |
| ------------------------ | ------------------ | --------------------------------------------------- |
| 🔢 **Numéro de passage** | ⏱️ **Temps**       | 👨‍⚖️ **Jury** : Accès complet                         |
| 🏋️‍♂️ **Coach**             | ❌ **Pénalité**    | 🚪 **Entrée de Piste** : Accès aux couples entrants |
| 🏡 **Écurie**            | ⏳ **Temps total** | 📖 **Lecteur** : Accès limité                       |
|                          | 🏆 **Classement**  |                                                     |

---

## 🏅 Tableau 3 : Statuts des Épreuves, Statuts des Couples et Accessibilité

| 📌 **Statuts des Épreuves** | 🚦 **Statuts des Couples**                 | 🔑 **Accessibilité par Rôle**              |
| --------------------------- | ------------------------------------------ | ------------------------------------------ |
| ⏳ **A venir**              | 🟢 **Partant** : Inscrit, pas encore passé | 👨‍⚖️ **Jury** : Accès total                  |
| 🎯 **En cours**             | 🟡 **En piste** : Concourt actuellement    | 🚪 **Entrée de Piste** : Suivi des entrées |
| ✅ **Terminée**             | 🟠 **En bord de piste** : Attend son tour  | 📖 **Lecteur** : Visualisation restreinte  |
| 🔒 **Clôturée**             | ❌ **Non Partant** : Ne participera pas    |                                            |
|                             | 🏁 **Fini** : A terminé l'épreuve          |                                            |
|                             | 🚫 **Éliminé** : Disqualifié               |                                            |
