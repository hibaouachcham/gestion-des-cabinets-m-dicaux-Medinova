# Configuration du Timeout de Session

## ✅ Configuration Actuelle

La session est maintenant configurée pour rester active **24 heures** au lieu de 30 minutes.

### Fichiers Modifiés

1. **`application.yml`**
   - `server.servlet.session.timeout: 24h` (au lieu de 30m)
   - `server.servlet.session.cookie.max-age: 86400` (24 heures en secondes)

2. **`AuthController.java`**
   - `session.setMaxInactiveInterval(24 * 60 * 60)` (86400 secondes = 24 heures)

## 🔄 Comment ça fonctionne

- **Timeout de session** : 24 heures d'inactivité avant expiration
- **Rafraîchissement automatique** : Chaque requête authentifiée rafraîchit automatiquement la session
- **Cookie de session** : Le cookie JSESSIONID reste valide pendant 24 heures

## 📝 Notes

- La session se rafraîchit automatiquement à chaque requête API authentifiée
- Si l'utilisateur reste actif (fait des requêtes), la session ne s'expirera jamais
- La session expire seulement après 24 heures d'inactivité complète

## 🔧 Personnalisation

Pour modifier le timeout, changez la valeur dans `application.yml` :

```yaml
server:
  servlet:
    session:
      timeout: ${SESSION_TIMEOUT:24h}  # Modifier ici (ex: 48h, 7d, etc.)
```

Et dans `AuthController.java` :

```java
session.setMaxInactiveInterval(24 * 60 * 60); // Modifier ici
```

## ⚠️ Sécurité

En production, il est recommandé d'utiliser un timeout plus court (ex: 2-4 heures) pour des raisons de sécurité.

