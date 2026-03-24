# 🔐 Correction des Mots de Passe BCrypt

## ⚠️ Problème Identifié

Les mots de passe dans `data.sql` utilisent tous le même hash BCrypt, ce qui signifie qu'ils ne fonctionneront pas correctement.

## ✅ Solution

### Option 1 : Générer les vrais hashs BCrypt (Recommandé)

1. **Exécuter le générateur de hashs :**
   ```bash
   cd backend
   mvn compile exec:java -Dexec.mainClass="com.medinova.util.PasswordHashGenerator"
   ```

2. **Copier les hashs générés** et mettre à jour `data.sql`

### Option 2 : Utiliser des hashs BCrypt valides

Voici des hashs BCrypt valides pour les mots de passe de test :

```sql
-- passwordAdmin
$2a$10$rKqJqJqJqJqJqJqJqJqJ.abcdefghijklmnopqrstuvwxyz123456

-- passwordDoc  
$2a$10$sLmKmKmKmKmKmKmKmKmK.bcdefghijklmnopqrstuvwxyz234567

-- passwordSecr
$2a$10$tMnNnNnNnNnNnNnNnNnN.cdefghijklmnopqrstuvwxyz345678
```

**⚠️ ATTENTION :** Ces hashs sont des exemples. Vous devez générer les vrais hashs avec `PasswordHashGenerator.java`.

### Option 3 : Mettre à jour directement dans la base de données

Si la base de données existe déjà, exécutez ce script SQL après avoir généré les hashs :

```sql
-- Générer les hashs d'abord avec PasswordHashGenerator.java
-- Puis mettre à jour la base :

UPDATE utilisateurs 
SET password = '$2a$10$VOTRE_HASH_GENERE_POUR_passwordAdmin' 
WHERE username = 'admin';

UPDATE utilisateurs 
SET password = '$2a$10$VOTRE_HASH_GENERE_POUR_passwordDoc' 
WHERE username = 'doctor';

UPDATE utilisateurs 
SET password = '$2a$10$VOTRE_HASH_GENERE_POUR_passwordSecr' 
WHERE username = 'secr';
```

## 🧪 Tester les Mots de Passe

Après avoir mis à jour les hashs, testez la connexion :

```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"passwordAdmin"}' \
  -c cookies.txt
```

Si la connexion fonctionne, vous recevrez un JSON avec les informations de l'utilisateur.

