# 🔍 Debug - Problème de Session

## Problème
Quand vous cliquez sur "Patients" (ou autre lien), vous êtes redirigé vers la page de login.

## ✅ Corrections Appliquées

### 1. Intercepteur Axios Amélioré
- Vérification de la session AVANT de rediriger
- Délai de 5 secondes avant redirection
- Logs détaillés pour déboguer

### 2. Gestion des Cookies
- `withCredentials: true` forcé sur chaque requête
- Vérification des cookies dans les logs

### 3. Flag `justLoggedIn` Prolongé
- Délai de grâce de 10 secondes après le login
- Vérification de la session après le login

## 🧪 Tests à Effectuer

### 1. Ouvrir la Console du Navigateur (F12)
Vous devriez voir :
- `Requête API: GET /api/patients` avec les cookies
- `Erreur 401 détectée sur: /api/patients` si erreur
- `✅ Session valide confirmée` si la session est OK
- `❌ Session invalide` si la session est vraiment expirée

### 2. Vérifier les Cookies
Dans la console, tapez :
```javascript
document.cookie
```

Vous devriez voir :
- `JSESSIONID=...` (cookie de session)
- `XSRF-TOKEN=...` (token CSRF)

### 3. Vérifier les Requêtes dans l'Onglet Network
1. Ouvrez l'onglet **Network** (F12)
2. Cliquez sur "Patients"
3. Regardez la requête vers `/api/patients`
4. Vérifiez dans **Headers** → **Request Headers** :
   - `Cookie: JSESSIONID=...` doit être présent
   - `X-XSRF-TOKEN: ...` doit être présent

## 🔧 Si le Problème Persiste

### Vérifier que le Backend est Démarré
```bash
cd backend
mvn spring-boot:run
```

### Vérifier la Configuration CORS
Le backend doit avoir :
```java
configuration.setAllowCredentials(true);
```

### Vérifier les Cookies dans le Backend
Dans `application.yml`, vérifiez :
```yaml
server:
  servlet:
    session:
      cookie:
        http-only: true
        secure: false
        same-site: lax
```

## 📝 Logs à Partager

Si le problème persiste, partagez :
1. Les logs de la console du navigateur
2. Les requêtes dans l'onglet Network (screenshot)
3. Les cookies présents (`document.cookie`)

