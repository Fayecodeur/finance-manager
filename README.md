# Sama Budget — Application de gestion financière personnelle

Application web full-stack permettant de suivre ses revenus, ses dépenses, son solde et d'analyser ses habitudes financières grâce à un tableau de bord.

Projet universitaire de Master 1 — Développement Web avec Angular.

## Fonctionnalités

- Authentification sécurisée (inscription, connexion, JWT)
- Protection des routes : accès refusé aux pages privées sans connexion, et accès refusé à `/login`/`/register` si déjà connecté
- **Tableau de bord** : solde, revenus, dépenses, nombre de transactions, avec comparaison au mois précédent (pourcentage et tendance), graphiques (répartition par catégorie, évolution mensuelle)
- **Transactions** : CRUD complet, recherche, tri, pagination, filtres avancés (type, catégorie)
- **Catégories** : CRUD complet, recherche, pagination
- **Rapports** : page dédiée avec résumé par période, export des transactions en CSV, Excel et PDF (filtrable par mois et par type)
- **Profil** : modification des informations personnelles, changement de mot de passe, réinitialisation de toutes les transactions (zone dangereuse avec confirmation renforcée)
- Mode sombre persistant (conservé après rechargement)
- Interface entièrement responsive
- Page d'accueil (landing) avec présentation du projet et connexion/inscription en boîte de dialogue
- Notifications (toasts) de succès/erreur cohérentes sur toute l'application
- États de chargement et états vides sur toutes les pages
- Page 404 personnalisée

## Technologies

**Frontend**

- Angular 21 (Standalone Components, Signals, Reactive Forms)
- Angular Material
- Chart.js (ng2-charts)
- jsPDF + jspdf-autotable (export PDF)
- SheetJS / xlsx (export Excel)
- TypeScript, SCSS

**Backend**

- Node.js / Express.js
- TypeScript
- MongoDB (Mongoose) — hébergé sur MongoDB Atlas
- JWT (authentification)
- bcrypt (hachage des mots de passe)

## Déploiement

- **Frontend** : Vercel
- **Backend** : Render
- **Base de données** : MongoDB Atlas

## Architecture

### Frontend

```
frontend/src/
├── index.html
├── main.ts
├── styles.scss
│
├── app/
│   ├── app.config.ts
│   ├── app.routes.ts
│   ├── app.ts / app.html / app.scss
│   │
│   ├── core/
│   │   ├── guards/          # auth-guard (routes privées), guest-guard (routes publiques)
│   │   ├── interceptors/    # Injection automatique du token JWT
│   │   └── services/        # auth, category, dashboard, notification, theme, transaction, user...
│   │
│   ├── features/
│   │   ├── auth/            # login, register
│   │   ├── landing/         # Page d'accueil + boîte de dialogue d'authentification
│   │   ├── dashboard/       # Statistiques, comparaison mensuelle et graphiques
│   │   ├── transactions/    # CRUD transactions, filtres, formulaire
│   │   ├── categories/      # CRUD catégories + formulaire
│   │   ├── reports/         # Résumé par période et export CSV/Excel/PDF
│   │   └── profile/         # Informations utilisateur, mot de passe, reset des transactions
│   │
│   ├── layout/
│   │   ├── header/          # Barre supérieure (branding, thème, déconnexion)
│   │   ├── sidebar/         # Navigation principale
│   │   └── main-layout/     # Structure englobant les pages privées
│   │
│   └── shared/
│       ├── models/               # Interfaces TypeScript (User, Category, Transaction)
│       ├── confirm-dialog/       # Dialogue de confirmation générique
│       ├── danger-confirm-dialog/# Dialogue de confirmation renforcée (saisie d'un mot-clé)
│       ├── empty-state/          # Composant d'état vide réutilisable
│       ├── loading-spinner/      # Composant de chargement réutilisable
│       └── not-found/            # Page 404
│
└── environments/
    └── environment.ts
```

### Backend

```
backend/src/
├── server.ts
├── config/
│   └── db.ts                # Connexion MongoDB Atlas
├── controllers/              # Logique métier (auth, users, transactions, categories, dashboard)
├── routes/                   # Définition des routes API
├── models/                   # Schémas Mongoose (User, Transaction, Category)
└── middlewares/
    └── authMiddleware.ts     # Vérification du token JWT
```

## Installation

### Prérequis

- Node.js (v18 ou supérieur)
- Un compte MongoDB Atlas (ou une instance MongoDB locale)

### Backend

```bash
cd backend
npm install
```

Créer un fichier `.env` à la racine de `backend/` :

```
PORT=5000
MONGO_URI=votre_chaine_de_connexion_mongodb
JWT_SECRET=votre_secret_jwt
```

Lancer le serveur :

```bash
npm run dev
```

Le serveur démarre sur `http://localhost:5000`.

### Frontend

```bash
cd frontend
npm install
ng serve
```

L'application est accessible sur `http://localhost:4200`.

## API — Endpoints principaux

| Méthode             | Route                         | Description                                                                                       |
| ------------------- | ----------------------------- | ------------------------------------------------------------------------------------------------- |
| POST                | `/api/auth/register`          | Inscription                                                                                       |
| POST                | `/api/auth/login`             | Connexion                                                                                         |
| GET                 | `/api/users/profile`          | Récupérer le profil                                                                               |
| PUT                 | `/api/users/profile`          | Modifier le profil                                                                                |
| PUT                 | `/api/users/change-password`  | Changer le mot de passe                                                                           |
| GET/POST/PUT/DELETE | `/api/transactions`           | CRUD transactions (avec filtres `search`, `type`, `category`, `sortBy`, `order`, `page`, `limit`) |
| DELETE              | `/api/transactions/reset-all` | Supprimer toutes les transactions                                                                 |
| GET/POST/PUT/DELETE | `/api/categories`             | CRUD catégories                                                                                   |
| GET                 | `/api/dashboard/stats`        | Statistiques du tableau de bord (dont comparaison au mois précédent)                              |

Toutes les routes (sauf `/auth`) nécessitent un token JWT dans le header `Authorization: Bearer <token>`.

## Auteur

Demba Faye
