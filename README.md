# Asso Miaou - Système de Gestion d'Association

## Aperçu

Asso Miaou est une application web complète conçue pour gérer les opérations d'une association. Elle offre des fonctionnalités pour la gestion des membres, des groupes, du matériel et des commandes. L'application propose différents rôles d'utilisateurs (membres actifs et clients) avec des contrôles d'accès appropriés.

## Fonctionnalités

### Gestion des Utilisateurs
- **Authentification** : Système sécurisé de connexion et d'inscription
- **Rôles Utilisateurs** : Deux types d'utilisateurs - ACTIF (membres actifs) et CLIENT (membres réguliers)
- **Gestion de Profil** : Les utilisateurs peuvent consulter et mettre à jour leurs informations de profil

### Tableau de Bord
- **Statistiques Générales** : Affichage des métriques clés incluant les revenus, le nombre de membres, le nombre de groupes et le nombre de commandes
- **Graphiques de Revenus** : Représentation visuelle des données de revenus
- **Performance des Vendeurs** : Tableau montrant les métriques de performance des membres actifs

### Gestion des Groupes (membres ACTIF uniquement)
- **Création de Groupes** : Ajouter de nouveaux groupes avec numéro, nom, ville et code postal
- **Visualisation des Groupes** : Lister tous les groupes avec leurs détails
- **Suppression de Groupes** : Supprimer les groupes qui n'ont pas de membres
- **Gestion des Membres** : Voir les membres associés à chaque groupe

### Gestion du Matériel (membres ACTIF uniquement)
- **Ajout de Matériel** : Enregistrer du nouveau matériel avec numéro de série, marque, modèle, type, prix et affectation de groupe
- **Visualisation du Matériel** : Lister tout le matériel avec ses détails
- **Suppression de Matériel** : Retirer du matériel du système

### Gestion des Commandes
- **Pour les CLIENTS** :
  - Passer des commandes de matériel
  - Consulter l'historique des commandes
  - Rechercher des produits
  - Générer les détails des commandes

- **Pour les membres ACTIFS** :
  - Consulter les informations de facturation
  - Générer des factures PDF
  - Suivre les performances de vente
  - Consulter l'historique des transactions

### Fonctionnalité de Recherche
- Rechercher des commandes par plage de dates
- Filtrer les produits par marque, modèle ou type

## Technologies Utilisées

- **Frontend** : HTML, CSS, JavaScript, Bootstrap (template Argon Dashboard)
- **Backend** : API RESTful (accessible via `http://localhost:8080/api/`)
- **Serveur** : Serveur HTTP intégré de Python pour le développement

## Comment Exécuter le Projet

### Prérequis
- Python 3.x installé sur votre système
- Navigateur web moderne (Chrome, Firefox, Safari, Edge)
- Serveur API backend fonctionnant sur le port 8080

### Étapes pour Exécuter

1. **Cloner le dépôt**
   ```
   git clone <url-du-dépôt>
   cd asso-miaou-dashboard
   ```

2. **Démarrer le serveur de développement**
   ```
   python run.py
   ```
   Cela va :
   - Démarrer un serveur HTTP local sur le port 8000
   - Ouvrir automatiquement votre navigateur par défaut à `http://localhost:8000`

3. **Se connecter à l'application**
   - Utiliser des identifiants existants ou s'inscrire avec un nouveau compte
   - Différentes fonctionnalités seront disponibles selon votre rôle d'utilisateur (ACTIF ou CLIENT)

### Structure du Projet

- `pages/` : Contient toutes les pages HTML
  - `dashboard.html` : Vue principale du tableau de bord
  - `materiels.html` : Gestion du matériel
  - `groupes.html` : Gestion des groupes
  - `commande.html` : Placement de commandes (pour les clients)
  - `billing.html` : Gestion des commandes (pour les membres actifs)
  - `profile.html` : Profil utilisateur
  - `sign-in.html` & `sign-up.html` : Pages d'authentification
  - `recherche.html` : Fonctionnalité de recherche

- `assets/` : Contient toutes les ressources statiques
  - `js/` : Fichiers JavaScript pour chaque page
  - `css/` : Fichiers de style
  - `img/` : Images et icônes

## Points d'Accès API

L'application interagit avec une API backend fonctionnant sur `http://localhost:8080`. Les points d'accès clés incluent :

- `/api/membres` : Gestion des utilisateurs
- `/api/groupes` : Gestion des groupes
- `/api/materiels` : Gestion du matériel
- `/api/commandes` : Gestion des commandes

## Notes pour les Développeurs

- L'application utilise localStorage pour maintenir les sessions utilisateur
- Le système de navigation s'ajuste dynamiquement selon le rôle de l'utilisateur
- Le projet utilise le template Argon Dashboard pour les composants UI
- Toutes les requêtes API sont effectuées en utilisant l'API Fetch

## Dépannage

- Si le navigateur ne s'ouvre pas automatiquement, naviguez manuellement vers `http://localhost:8000`
- Assurez-vous que le serveur API backend fonctionne sur le port 8080
- Vérifiez la console du navigateur pour tout erreur JavaScript
- Si vous rencontrez des problèmes CORS, assurez-vous que votre serveur backend a les en-têtes CORS appropriés configurés 