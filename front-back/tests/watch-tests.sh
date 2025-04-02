#!/bin/sh

while true; do
    echo "Exécution des tests..."
    sh check-services.sh
    
    echo "\nEn attente de nouvelles modifications..."
    echo "Pour relancer les tests manuellement : docker-compose exec test-runner sh check-services.sh"
    
    # Attendre indéfiniment
    tail -f /dev/null
done
