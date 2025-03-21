# SPIRIT

<u>17/03/2024</u>

Diego Montorier  
Matheus Kops Guedes  
Abdelali Imzilen  
Adam Bekkali  
Maïlys Poulain  


## Technologies:
bd: postgresql  
back-end: Next  
Front-end: Next.js  


## Users stories:
1. Authentification et Accès
2. Sélection du Concours
3. Gestion des Épreuves
4. Gestion des Couples dans une Épreuve
5. Suivi des Résultats
6. Gestion des Statuts des Épreuves


## 🏆 Tableau 1 : Compétitions, Épreuves et Couples

| 🏅 **Compétitions** | 📋 **Épreuves** | 🐴👤 **Couples (Cavalier & Cheval)** |
|--------------------|---------------|--------------------------------|
| 🔢 **Numéro** | 🔢 **Numéro d'ordre** | 👤 **Cavalier** : Nom, Prénom, Licence |
| 🏆 **Intitulé** | 🏁 **Intitulé** | 🐴 **Cheval** : Nom, Numéro de sire |
| 🎭 **Type** (CSO/Equifun) | 📌 **Statut** : A venir, En cours, Terminée, Clôturée | 🚦 **Statut du couple** : Partant, En piste, En bord de piste, Non Partant, Fini, Éliminé |

---

## 📊 Tableau 2 : Événements, Résultats et Rôles des Utilisateurs  

| 🎟️ **Événements** | 🏁 **Résultats** | 🎭 **Rôles des Utilisateurs** |
|-----------------|------------|---------------------|
| 🔢 **Numéro de passage** | ⏱️ **Temps** | 👨‍⚖️ **Jury** : Accès complet |
| 🏋️‍♂️ **Coach** | ❌ **Pénalité** | 🚪 **Entrée de Piste** : Accès aux couples entrants |
| 🏡 **Écurie** | ⏳ **Temps total** | 📖 **Lecteur** : Accès limité |
| | 🏆 **Classement** | |

---

## 🏅 Tableau 3 : Statuts des Épreuves, Statuts des Couples et Accessibilité  

| 📌 **Statuts des Épreuves** | 🚦 **Statuts des Couples** | 🔑 **Accessibilité par Rôle** |
|------------------|----------------------|-------------------|
| ⏳ **A venir** | 🟢 **Partant** : Inscrit, pas encore passé | 👨‍⚖️ **Jury** : Accès total |
| 🎯 **En cours** | 🟡 **En piste** : Concourt actuellement | 🚪 **Entrée de Piste** : Suivi des entrées |
| ✅ **Terminée** | 🟠 **En bord de piste** : Attend son tour | 📖 **Lecteur** : Visualisation restreinte |
| 🔒 **Clôturée** | ❌ **Non Partant** : Ne participera pas | |
| | 🏁 **Fini** : A terminé l’épreuve | |
| | 🚫 **Éliminé** : Disqualifié | |
