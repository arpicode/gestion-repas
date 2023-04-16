# Projet Gestion Repas

# Projet Gestion Repas

## Groupe 3

## Installation

1. Créer la base de données Maria DB ou MySQL (toutes les requêtes n’ont pas été testées sur MySQL mais ça devrait fonctionner) avec l’interclassement `utf8mb4_general_ci`.

2. Mettre à jour le fichier `.env` avec les paramètres de connexions.

3. Installer les dépendances du projet : `npm install`.

4. Exécuter le script `npm run migrate` pour créer les tables et valoriser la base de données.

5. Démarrer le serveur de l’application via `npm start` ou `npm run dev` (le script `dev` nécessite d’avoir nodemon d’installé en global (`npm install -g nodemon`).

6. L’application devrait être accessible sur http://127.0.0.1:3000/ (le port correspond à la variable `PORT` du `.env`).
