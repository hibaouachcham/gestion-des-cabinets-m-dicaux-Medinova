# Configuration MySQL Workbench pour Medinova

## 📋 Informations de connexion

- **Host**: localhost
- **Port**: 3306
- **Username**: root
- **Password**: Hiba123@#

## 🚀 Étapes de configuration

### 1. Vérifier la connexion MySQL

1. Ouvrir MySQL Workbench
2. Créer une nouvelle connexion si nécessaire :
   - **Connection Name**: Medinova Local
   - **Hostname**: localhost
   - **Port**: 3306
   - **Username**: root
   - **Password**: Hiba123@#
3. Tester la connexion

### 2. Créer la base de données (optionnel)

La base de données sera créée automatiquement au premier démarrage du backend grâce à `createDatabaseIfNotExist=true`.

Si vous préférez la créer manuellement :

```sql
CREATE DATABASE IF NOT EXISTS medinova 
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;
```

### 3. Vérifier les privilèges

Assurez-vous que l'utilisateur `root` a les privilèges nécessaires :

```sql
GRANT ALL PRIVILEGES ON medinova.* TO 'root'@'localhost';
FLUSH PRIVILEGES;
```

### 4. Configuration dans l'application

Le fichier `application.yml` est déjà configuré avec :
- Port: 3306
- Username: root
- Password: Hiba123@#

Si vous devez changer ces valeurs, modifiez `backend/src/main/resources/application.yml` ou créez un fichier `.env` dans le dossier backend.

### 5. Tester la connexion

Lancez le backend :
```bash
cd backend
mvn spring-boot:run
```

Vous devriez voir dans les logs :
```
HikariPool-1 - Starting...
HikariPool-1 - Start completed.
```

Si vous voyez des erreurs de connexion, vérifiez :
1. Que MySQL est bien démarré
2. Que le port 3306 est correct
3. Que le mot de passe est correct
4. Que l'utilisateur root a les permissions nécessaires

## 🔧 Dépannage

### Erreur: "Access denied for user 'root'@'localhost'"
- Vérifiez le mot de passe dans `application.yml`
- Vérifiez que l'utilisateur root existe et a les bonnes permissions

### Erreur: "Communications link failure"
- Vérifiez que MySQL est démarré
- Vérifiez le port (3306)
- Vérifiez le firewall

### Erreur: "Unknown database 'medinova'"
- La base sera créée automatiquement, mais vous pouvez aussi la créer manuellement (voir étape 2)

## 📝 Notes

- Les scripts SQL (`schema.sql` et `data.sql`) seront exécutés automatiquement au démarrage
- Les données d'exemple seront insérées automatiquement
- Les mots de passe dans `data.sql` doivent être hashés avec BCrypt (utiliser `PasswordHashGenerator.java`)

