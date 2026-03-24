# Guide de Dépannage - Medinova Backend

## 🔧 Problèmes Courants

### Erreur: Schema-validation: wrong column type encountered

**Symptôme:**
```
Schema-validation: wrong column type encountered in column [type] in table [abonnements];
found [varchar], but expecting [enum ('basic','premium','enterprise')]
```

**Cause:**
Hibernate en mode `validate` compare le schéma de la base de données avec les entités JPA. Quand une colonne Enum est stockée en VARCHAR dans MySQL, Hibernate peut s'attendre à un type ENUM MySQL.

**Solution appliquée:**
Toutes les colonnes Enum dans les entités ont été configurées avec `columnDefinition = "VARCHAR(x)"` pour forcer Hibernate à accepter VARCHAR au lieu d'ENUM.

**Entités corrigées:**
- ✅ `Abonnement.type` → `VARCHAR(20)`
- ✅ `Utilisateur.role` → `VARCHAR(20)`
- ✅ `Patient.sexe` → `VARCHAR(1)`
- ✅ `RendezVous.statut` → `VARCHAR(20)`
- ✅ `Facture.statutPaiement` → `VARCHAR(20)`

**Alternative (si le problème persiste):**
Si vous continuez à avoir des problèmes, vous pouvez temporairement changer la stratégie Hibernate dans `application.yml` :

```yaml
spring:
  jpa:
    hibernate:
      ddl-auto: update  # Au lieu de validate
```

⚠️ **Attention:** `update` modifie automatiquement le schéma. Utilisez `validate` en production.

### Erreur de connexion MySQL

**Symptôme:**
```
Communications link failure
Access denied for user 'root'@'localhost'
```

**Solutions:**
1. Vérifier que MySQL est démarré
2. Vérifier le port (3306)
3. Vérifier le mot de passe dans `application.yml`
4. Vérifier les privilèges MySQL :
   ```sql
   GRANT ALL PRIVILEGES ON medinova.* TO 'root'@'localhost';
   FLUSH PRIVILEGES;
   ```

### Erreur: Table doesn't exist

**Symptôme:**
```
Table 'medinova.abonnements' doesn't exist
```

**Solution:**
1. Vérifier que `schema.sql` est exécuté
2. Vérifier la configuration dans `application.yml` :
   ```yaml
   spring:
     sql:
       init:
         mode: always
         schema-locations: classpath:schema.sql
         data-locations: classpath:data.sql
   ```
3. Supprimer et recréer la base de données si nécessaire

### Erreur CSRF

**Symptôme:**
```
Invalid CSRF token
```

**Solutions:**
1. Vérifier que `withCredentials: true` est configuré dans axios
2. Vérifier que le cookie `XSRF-TOKEN` est présent
3. Vérifier la configuration CORS dans `SecurityConfig.java`

### Erreur: Port already in use

**Symptôme:**
```
Port 8080 is already in use
```

**Solution:**
1. Changer le port dans `application.yml` :
   ```yaml
   server:
     port: 8081
   ```
2. Ou tuer le processus utilisant le port :
   ```bash
   # Windows
   netstat -ano | findstr :8080
   taskkill /PID <PID> /F
   
   # Linux/Mac
   lsof -ti:8080 | xargs kill -9
   ```

## 📝 Notes Importantes

- **Mode Hibernate:** `validate` est recommandé en production pour éviter les modifications accidentelles du schéma
- **Mots de passe BCrypt:** Utiliser `PasswordHashGenerator.java` pour générer les hashs corrects
- **Logs:** Activer les logs SQL avec `show-sql: true` pour déboguer les requêtes

