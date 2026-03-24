# Medinova Frontend - Documentation

Frontend React avec Vite et TailwindCSS pour le système de gestion de cabinet médical.

## Technologies

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: TailwindCSS 3
- **Routing**: React Router DOM 6
- **HTTP Client**: Axios
- **Icons**: Heroicons

## Structure

```
src/
├── components/      # Composants réutilisables
│   ├── Header.jsx
│   ├── Sidebar.jsx
│   ├── PatientForm.jsx
│   └── AutocompleteMedicaments.jsx
├── pages/          # Pages de l'application
│   ├── Login.jsx
│   ├── DashboardAdmin.jsx
│   ├── DashboardDoctor.jsx
│   ├── DashboardSecretary.jsx
│   ├── PatientsPage.jsx
│   ├── RendezVousPage.jsx
│   ├── ConsultationPage.jsx
│   └── FacturesPage.jsx
├── services/       # Services API
│   └── api.js
├── styles/         # Styles CSS
│   └── index.css
├── App.jsx         # Composant principal
└── main.jsx        # Point d'entrée
```

## Installation et Démarrage

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build pour production
npm run build

# Prévisualiser le build de production
npm run preview
```

## Configuration

### Variables d'environnement

Créer un fichier `.env` dans le dossier frontend :

```env
VITE_API_URL=http://localhost:8080/api
```

Par défaut, l'application utilise `http://localhost:8080/api`.

### Configuration Axios

L'instance Axios est configurée dans `src/services/api.js` :

- `withCredentials: true` : Important pour les sessions HTTP
- Gestion automatique du token CSRF
- Intercepteur pour redirection en cas d'erreur 401

##  Authentification

### Flux d'authentification

1. **Connexion** : `POST /api/auth/login`
   - Stocke la session côté serveur (cookie)
   - Récupère les informations utilisateur

2. **Vérification** : `GET /api/auth/me`
   - Vérifie la session à chaque chargement
   - Redirige vers `/login` si non authentifié

3. **Déconnexion** : `POST /api/auth/logout`
   - Invalide la session serveur
   - Redirige vers `/login`

### Protection des routes

Les routes sont protégées par le composant `ProtectedRoute` dans `App.jsx` :
- Vérifie l'authentification
- Vérifie les rôles autorisés

## Styling avec TailwindCSS

### Classes personnalisées

Classes utilitaires définies dans `src/styles/index.css` :

- `.btn` / `.btn-primary` / `.btn-secondary` / `.btn-danger`
- `.input`
- `.card`

### Couleurs

Palette de couleurs principale dans `tailwind.config.js` :
- Primary: Bleu (#0ea5e9)

## Pages

### Login
- Formulaire de connexion
- Affichage des comptes de test

### Dashboards
- **Admin**: Statistiques globales
- **Doctor**: Patient en file d'attente, actions rapides
- **Secretary**: Actions rapides

### Patients
- Liste paginée avec recherche
- Formulaire d'ajout/modification
- Bouton "Envoyer au médecin" (file d'attente)

### Rendez-vous
- Liste avec filtrage par date
- Affichage des statuts

### Consultation
- Formulaire complet de consultation
- Autocomplétion des médicaments
- Génération d'ordonnance

### Factures
- Liste des factures
- Génération de PDF

## Gestion de l'État

L'état est géré localement dans chaque composant avec `useState` et `useEffect`.

Pour des besoins plus complexes, envisager d'utiliser Context API ou Redux.

## Build et Déploiement

### Build de production

```bash
npm run build
```

Les fichiers statiques seront générés dans le dossier `dist/`.

### Déploiement

1. **Serveur statique** : Serveur les fichiers de `dist/` avec nginx, Apache, etc.
2. **Configuration** : Assurer que `VITE_API_URL` pointe vers le backend en production

## Dépannage

### Erreur CORS
- Vérifier que le backend est bien démarré
- Vérifier la configuration CORS dans le backend

### Erreur CSRF
- Vérifier que `withCredentials: true` est configuré
- Vérifier que le cookie `XSRF-TOKEN` est présent

### Erreur 401 (Non autorisé)
- Vérifier que la session n'a pas expiré
- Se reconnecter si nécessaire

## Ressources

- [React Documentation](https://react.dev)
- [Vite Documentation](https://vitejs.dev)
- [TailwindCSS Documentation](https://tailwindcss.com)
- [React Router Documentation](https://reactrouter.com)

