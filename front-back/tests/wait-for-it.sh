#!/bin/bash
# Script qui attend qu'un service soit disponible avant d'exécuter une commande

set -e

host="$1"
shift
cmd="$@"

until curl -s --head "http://$host" > /dev/null; do
  >&2 echo "En attente que le service $host soit disponible..."
  sleep 5
done

>&2 echo "Le service $host est disponible, exécution de la commande : $cmd"
exec $cmd