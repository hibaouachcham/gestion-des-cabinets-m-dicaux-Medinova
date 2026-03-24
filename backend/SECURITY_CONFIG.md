# Configuration Spring Security - Medinova

## ✅ Corrections Appliquées

### Problème Résolu
**Erreur:** `Pre-authenticated entry point called. Rejecting access` - Toutes les requêtes HTTP étaient bloquées.

**Cause:** La configuration Spring Security ne permettait pas l'accès public aux routes nécessaires (`/`, `/error`, `/actuator/health`).

## 🔐 Routes Publiques (Sans Authentification)

Les routes suivantes sont maintenant accessibles sans authentification :

1. **`/`** - Page racine
2. **`/error`** - Gestion des erreurs Spring Boot
3. **`/api/auth/**`** - Tous les endpoints d'authentification
   - `POST /api/auth/login`
   - `POST /api/auth/logout`
   - `GET /api/auth/me`
   - `GET /api/auth/csrf`
4. **`/api/public/**`** - Endpoints publics (si nécessaire)
5. **`/actuator/health`** - Endpoint de santé (monitoring)
6. **`/actuator/info`** - Informations sur l'application

## 🔒 Routes Sécurisées

### Par Rôle

#### ROLE_ADMIN (Administrateur)
- **`/api/admin/**`** - Gestion administrative
- **`/actuator/**`** - Tous les endpoints Actuator (sauf health/info)

#### ROLE_DOCTOR (Médecin)
- **`/api/doctor/**`** - Endpoints réservés aux médecins
- Accès également avec ROLE_ADMIN

#### ROLE_SECR (Secrétaire)
- **`/api/secr/**`** - Endpoints réservés aux secrétaires
- Accès également avec ROLE_ADMIN

### Routes Authentifiées (Tous Rôles)
- **`/api/patients/**`** - Gestion des patients
- **`/api/rendezvous/**`** - Gestion des rendez-vous
- **`/api/consultations/**`** - Consultations
- **`/api/factures/**`** - Factures
- **`/api/ordonnances/**`** - Ordonnances
- **`/api/medicaments/**`** - Médicaments
- **`/api/files/**`** - Upload de fichiers

## 🛡️ Configuration de Sécurité

### CSRF Protection
- **Token stocké dans cookie:** `XSRF-TOKEN`
- **Header requis:** `X-XSRF-TOKEN`
- **Ignoré pour:** `/api/public/**`, `/error`, `/actuator/health`

### Sessions HTTP
- **Création:** `IF_REQUIRED` (créée lors de l'authentification)
- **Maximum:** 1 session par utilisateur
- **Timeout:** 30 minutes (configurable)
- **Expiration:** Redirection vers `/api/auth/session-expired`

### CORS
- **Origines autorisées:**
  - `http://localhost:5173` (Vite dev)
  - `http://localhost:3000` (Create React App)
  - `http://localhost:5174` (Vite alternatif)
- **Credentials:** Activés (`withCredentials: true`)
- **Headers exposés:** `X-XSRF-TOKEN`

### Gestion des Erreurs
- **401 Unauthorized:** Retourne JSON `{"error":"Unauthorized","message":"Authentication required"}`
- **403 Forbidden:** Retourne JSON `{"error":"Forbidden","message":"Access denied"}`

## 📋 Ordre des Routes

L'ordre des `requestMatchers` est important ! Les routes les plus spécifiques doivent être déclarées en premier :

```java
.requestMatchers("/", "/error").permitAll()                    // 1. Routes racine
.requestMatchers("/api/auth/**", "/api/public/**").permitAll() // 2. Auth publique
.requestMatchers("/actuator/health", "/actuator/info").permitAll() // 3. Health publique
.requestMatchers("/actuator/**").hasRole("ADMIN")              // 4. Actuator admin
.requestMatchers("/api/admin/**").hasRole("ADMIN")             // 5. Admin
.requestMatchers("/api/doctor/**").hasAnyRole("DOCTOR", "ADMIN") // 6. Doctor
.requestMatchers("/api/secr/**").hasAnyRole("SECR", "ADMIN")   // 7. Secrétaire
.anyRequest().authenticated()                                  // 8. Tout le reste
```

## 🧪 Tests

### Tester les Routes Publiques

```bash
# Test de la racine
curl http://localhost:8080/

# Test de l'endpoint de santé
curl http://localhost:8080/actuator/health

# Test de l'authentification (devrait fonctionner)
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"passwordAdmin"}'
```

### Tester les Routes Sécurisées

```bash
# Sans authentification (devrait retourner 401)
curl http://localhost:8080/api/patients

# Avec authentification (après login)
curl http://localhost:8080/api/patients \
  -H "Cookie: JSESSIONID=..."
```

## 🔧 Configuration Actuator

Dans `application.yml` :

```yaml
management:
  endpoints:
    web:
      exposure:
        include: health,info,metrics
  endpoint:
    health:
      show-details: when-authorized
```

- **`/actuator/health`** - Public (sans détails)
- **`/actuator/info`** - Public
- **`/actuator/metrics`** - Admin seulement
- **`/actuator/**`** - Admin seulement

## ✅ Résultat

- ✅ Routes publiques accessibles sans authentification
- ✅ Routes sécurisées protégées par rôle
- ✅ Gestion correcte des sessions HTTP
- ✅ CSRF configuré correctement
- ✅ CORS configuré pour le frontend
- ✅ Gestion des erreurs d'authentification

Le backend devrait maintenant répondre correctement aux requêtes HTTP.

