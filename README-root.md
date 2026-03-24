# Medinova - Système de Gestion de Cabinet Médical

Application complète de gestion de cabinet médical avec backend Spring Boot et frontend React + TailwindCSS.

## 📋 Structure du Projet

```
Medinovaapp/
├── backend/          # Application Spring Boot (Java 17+)
├── frontend/         # Application React + Vite + TailwindCSS
└── README-root.md    # Ce fichier
```

## 🚀 Prérequis

### Backend
- Java 17 ou supérieur
- Maven 3.8+
- MySQL 8.0+ (MySQL Workbench ou serveur MySQL sur port 3306)
- MySQL doit être démarré et accessible

### Frontend
- Node.js 18+ et npm/yarn

## 📦 Installation et Démarrage

### 1. Configuration de la Base de Données

#### Configuration MySQL Workbench
1. Démarrer MySQL Workbench et vous connecter au serveur MySQL
2. Vérifier que MySQL est en cours d'exécution sur le port 3306
3. La base de données `medinova` sera créée automatiquement au premier démarrage

**Configuration par défaut dans `application.yml`:**
- **Host**: localhost:3306
- **Username**: root
- **Password**: Hiba123@#

**Pour utiliser une configuration personnalisée**, créer un fichier `.env` dans le dossier backend avec :
```properties
DATABASE_URL=jdbc:mysql://localhost:3306/medinova?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=Hiba123@#
SPRING_PROFILES_ACTIVE=dev
```

### 2. Backend (Spring Boot)

```bash
cd backend

# Installer les dépendances et compiler
mvn clean install

# Lancer l'application
mvn spring-boot:run
```

Le backend sera accessible sur `http://localhost:8080`

**Note importante sur les mots de passe BCrypt :**
Les mots de passe dans `data.sql` sont hashés. Pour générer de nouveaux hashs BCrypt, vous pouvez utiliser ce code Java :

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String hash = encoder.encode("passwordAdmin"); // ou passwordDoc, passwordSecr
System.out.println(hash);
```

### 3. Frontend (React + Vite)

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

Le frontend sera accessible sur `http://localhost:5173`

### 4. Accès à l'application

1. Ouvrir `http://localhost:5173` dans votre navigateur
2. Se connecter avec un des comptes de test :
   - **Admin**: `admin` / `passwordAdmin`
   - **Médecin**: `doctor` / `passwordDoc`
   - **Secrétaire**: `secr` / `passwordSecr`

## 🔐 Authentification

L'application utilise l'authentification par **sessions HTTP** (cookies) avec Spring Security.

- Les sessions sont stockées côté serveur
- Le token CSRF est géré automatiquement via cookies
- Le timeout de session est configurable (par défaut: 30 minutes)

## 📚 Documentation des APIs

Consultez les fichiers README dans chaque dossier :
- `backend/README.md` - Documentation backend complète
- `frontend/README.md` - Documentation frontend

### Endpoints principaux

#### Authentification
- `POST /api/auth/login` - Connexion
- `POST /api/auth/logout` - Déconnexion
- `GET /api/auth/me` - Informations utilisateur actuel
- `GET /api/auth/csrf` - Récupérer le token CSRF

#### Patients
- `GET /api/patients` - Liste des patients (pagination)
- `GET /api/patients/{id}` - Détails d'un patient
- `POST /api/patients` - Créer un patient
- `PUT /api/patients/{id}` - Modifier un patient
- `POST /api/patients/{id}/enqueue` - Ajouter à la file d'attente
- `GET /api/patients/queue/current` - Patient actuel en file d'attente

#### Rendez-vous
- `GET /api/rendezvous` - Liste des rendez-vous
- `POST /api/rendezvous` - Créer un rendez-vous
- `PUT /api/rendezvous/{id}` - Modifier un rendez-vous
- `DELETE /api/rendezvous/{id}` - Supprimer un rendez-vous

#### Consultations
- `POST /api/consultations` - Créer une consultation
- `GET /api/consultations/{id}` - Détails d'une consultation

#### Factures
- `GET /api/factures` - Liste des factures
- `POST /api/factures` - Créer une facture
- `GET /api/factures/{id}/pdf` - Générer le PDF de la facture

#### Ordonnances
- `POST /api/ordonnances` - Créer une ordonnance
- `GET /api/ordonnances/{id}/pdf` - Générer le PDF de l'ordonnance

#### Médicaments
- `GET /api/medicaments?q=query` - Rechercher des médicaments

## 🔒 Rôles et Permissions

- **ROLE_ADMIN** : Accès complet à toutes les fonctionnalités
- **ROLE_DOCTOR** : Gestion des consultations, patients, rendez-vous
- **ROLE_SECR** : Gestion des patients, rendez-vous, factures

## 📝 Exemple de requête cURL

### Connexion
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"passwordAdmin"}' \
  -c cookies.txt
```

### Créer un patient (avec session)
```bash
curl -X POST http://localhost:8080/api/patients \
  -H "Content-Type: application/json" \
  -b cookies.txt \
  -d '{
    "cin": "AB999999",
    "nom": "Test",
    "prenom": "Patient",
    "sexe": "M",
    "telephone": "0612345678"
  }'
```

## 🛠️ Développement

### Backend
- Port: 8080
- Profil par défaut: `dev`
- Hot reload: activé avec Spring Boot DevTools

### Frontend
- Port: 5173
- Hot reload: activé avec Vite
- Proxy API: configuré dans `vite.config.js`

## 📦 Build pour Production

### Backend
```bash
cd backend
mvn clean package
java -jar target/medinova-backend-1.0.0.jar
```

### Frontend
```bash
cd frontend
npm run build
# Les fichiers statiques seront dans dist/
```

## 🐛 Dépannage

### Erreur de connexion à la base de données
- Vérifier que MySQL est démarré
- Vérifier le port (3307 pour XAMPP)
- Vérifier les credentials dans `application.yml`

### Erreur CORS
- Vérifier que le backend est bien démarré sur le port 8080
- Vérifier la configuration CORS dans `SecurityConfig.java`

### Erreur CSRF
- Vérifier que `withCredentials: true` est configuré dans axios
- Vérifier que le token CSRF est récupéré au démarrage

## 📞 Support

Pour toute question ou problème, consultez la documentation détaillée dans les dossiers `backend/` et `frontend/`.

## 📄 Licence

Ce projet est fourni à des fins éducatives et de démonstration.

