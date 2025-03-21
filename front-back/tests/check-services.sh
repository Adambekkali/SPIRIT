#!/bin/bash

echo "Vérification des services requis..."

# Attendre que Selenium soit prêt
echo "Attente du service Selenium..."
/wait-for-it.sh selenium:4444 --

# Attendre que l'application frontend/backend soit prête
echo "Attente du service front-back..."
/wait-for-it.sh front-back:3000 --

echo "Tous les services sont prêts ! Démarrage des tests..."
python test_login.py