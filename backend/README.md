# Medinova Backend - Documentation

Backend Spring Boot pour le système de gestion de cabinet médical.

## 🏗️ Architecture

- **Framework**: Spring Boot 3.2.0
- **Java**: 17+
- **Build**: Maven
- **Base de données**: MySQL (MySQL Workbench, port 3306)
- **Sécurité**: Spring Security avec sessions HTTP

## 📁 Structure

```
src/main/java/com/medinova/
├── config/          # Configuration (Security, WebMvc, Audit)
├── controller/      # Controllers REST
├── dto/             # Data Transfer Objects
├── entity/          # Entités JPA
├── repository/      # Repositories Spring Data JPA
├── service/         # Services métier
└── util/            # Utilitaires (PDF, FileStorage)
```

## 🔧 Configuration

### Variables d'environnement

Créer un fichier `.env` dans le dossier backend ou définir les variables suivantes :

```properties
DATABASE_URL=jdbc:mysql://localhost:3306/medinova?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
SPRING_DATASOURCE_USERNAME=root
SPRING_DATASOURCE_PASSWORD=Hiba123@#
SPRING_PROFILES_ACTIVE=dev
SERVER_PORT=8080
SESSION_TIMEOUT=30m
UPLOAD_DIR=./uploads
PDF_OUTPUT_DIR=./pdf-output
```

## 🚀 Commandes

```bash
# Installer les dépendances
mvn clean install

# Lancer en développement
mvn spring-boot:run

# Lancer avec un profil spécifique
mvn spring-boot:run -Dspring-boot.run.profiles=prod

# Créer un JAR exécutable
mvn clean package
java -jar target/medinova-backend-1.0.0.jar
```

## 📡 Endpoints REST

### Authentification

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/auth/login` | Connexion | Public |
| POST | `/api/auth/logout` | Déconnexion | Authentifié |
| GET | `/api/auth/me` | Utilisateur actuel | Authentifié |
| GET | `/api/auth/csrf` | Token CSRF | Public |

### Patients

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/patients` | Liste paginée | Tous |
| GET | `/api/patients/{id}` | Détails | Tous |
| POST | `/api/patients` | Créer | Tous |
| PUT | `/api/patients/{id}` | Modifier | Tous |
| POST | `/api/patients/{id}/enqueue` | Ajouter à la file | DOCTOR |
| GET | `/api/patients/queue/current` | Patient actuel | DOCTOR |

**Paramètres de pagination:**
- `page`: Numéro de page (défaut: 0)
- `size`: Taille de page (défaut: 10)
- `search`: Recherche (nom, prénom, CIN)
- `sortBy`: Champ de tri
- `sortDir`: Direction (ASC/DESC)

### Rendez-vous

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/rendezvous` | Liste paginée | Tous |
| GET | `/api/rendezvous/{id}` | Détails | Tous |
| POST | `/api/rendezvous` | Créer | Tous |
| PUT | `/api/rendezvous/{id}` | Modifier | Tous |
| DELETE | `/api/rendezvous/{id}` | Supprimer | Tous |

**Paramètres de filtrage:**
- `from`: Date de début (ISO 8601)
- `to`: Date de fin (ISO 8601)

### Consultations

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/consultations` | Créer | DOCTOR |
| GET | `/api/consultations/{id}` | Détails | DOCTOR |

**Paramètres POST:**
- `patientId` (requis)
- `rendezVousId` (optionnel)
- `motif`, `examenClinique`, `diagnostic`, `prescription`, `observations`

### Factures

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/factures` | Liste paginée | Tous |
| GET | `/api/factures/{id}` | Détails | Tous |
| POST | `/api/factures` | Créer | Tous |
| GET | `/api/factures/{id}/pdf` | Générer PDF | Tous |
| PATCH | `/api/factures/{id}/statut` | Modifier statut | Tous |

**Paramètres POST:**
- `patientId` (requis)
- `consultationId` (optionnel)
- `montantHT` (requis)
- `tauxTVA` (optionnel, défaut: 0.20)
- `notes` (optionnel)

### Ordonnances

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/ordonnances` | Créer | DOCTOR |
| GET | `/api/ordonnances/{id}` | Détails | DOCTOR |
| GET | `/api/ordonnances/{id}/pdf` | Générer PDF | DOCTOR |

### Médicaments

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/medicaments?q=query` | Rechercher | Public |
| GET | `/api/medicaments/all` | Tous les médicaments | Public |

### Administration

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| GET | `/api/admin/cabinets` | Liste cabinets | ADMIN |
| POST | `/api/admin/cabinets` | Créer cabinet | ADMIN |
| PUT | `/api/admin/cabinets/{id}` | Modifier cabinet | ADMIN |
| GET | `/api/admin/utilisateurs` | Liste utilisateurs | ADMIN |
| POST | `/api/admin/utilisateurs` | Créer utilisateur | ADMIN |
| POST | `/api/admin/medicaments/import` | Importer médicaments | ADMIN |
| GET | `/api/admin/stats` | Statistiques | ADMIN |

### Fichiers

| Méthode | Endpoint | Description | Auth |
|---------|----------|-------------|------|
| POST | `/api/files/upload` | Upload fichier | Tous |
| GET | `/api/files/{patientId}/{filename}` | Télécharger | Tous |

## 🔒 Sécurité

### Configuration CSRF

- Token stocké dans cookie `XSRF-TOKEN`
- Header requis: `X-XSRF-TOKEN`
- Configuration dans `SecurityConfig.java`

### Sessions

- Stockage: HTTP Session (serveur)
- Timeout: Configurable (défaut: 30 minutes)
- Maximum: 1 session par utilisateur

### Hashage des mots de passe

- Algorithme: BCrypt
- Force: 10 rounds

## 📊 Base de Données

### Scripts SQL

- `schema.sql`: Création des tables
- `data.sql`: Données d'exemple

### Génération des hashs BCrypt

Pour générer de nouveaux hashs BCrypt pour les mots de passe :

```java
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
String hash = encoder.encode("votreMotDePasse");
```

## 📄 Génération de PDF

Les PDFs sont générés avec iText 7 :
- Factures: `PDFGenerator.generateFacturePDF()`
- Ordonnances: `PDFGenerator.generateOrdonnancePDF()`

Fichiers générés dans le répertoire configuré par `medinova.pdf.output-dir`.

## 📝 Logging d'audit

Les actions suivantes sont journalisées :
- Connexion/Déconnexion
- Création de patient
- Création de facture
- Génération de PDF

Configuré dans `AuditAspect.java`.

## 🧪 Tests

```bash
# Lancer tous les tests
mvn test

# Lancer avec couverture
mvn test jacoco:report
```

## 🐛 Dépannage

### Port déjà utilisé
```bash
# Changer le port dans application.yml ou via variable d'env
SERVER_PORT=8081
```

### Erreur de connexion DB
- Vérifier que MySQL est démarré
- Vérifier les credentials
- Vérifier que la base `medinova` existe ou peut être créée

### Erreur CSRF
- Vérifier que `withCredentials: true` est configuré côté client
- Vérifier que le header `X-XSRF-TOKEN` est envoyé

