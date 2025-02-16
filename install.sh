#!/bin/bash
# Installation des dépendances
pip install -r requirements.txt

# Migration de la base de données
python manage.py migrate

# Création du compte démo (username: demo / password: Azerty!12345#)
python manage.py createdemo

# Collecte des fichiers statiques
python manage.py collectstatic --noinput

echo "Installation terminée. Vous pouvez lancer le serveur avec : python manage.py runserver"
