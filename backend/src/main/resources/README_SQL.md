# Scripts SQL - Documentation

## Configuration actuelle

Les scripts SQL (`schema.sql` et `data.sql`) sont **désactivés** par défaut dans `application.yml` :
```yaml
spring:
  sql:
    init:
      mode: never  # Les scripts ne s'exécutent pas automatiquement
```

## Pourquoi cette configuration ?

Cette configuration empêche la **réinitialisation automatique** de la base de données à chaque démarrage de l'application, ce qui permet de :
- ✅ Conserver les données créées via l'interface (cabinets, utilisateurs, patients, etc.)
- ✅ Éviter la perte de données lors des redémarrages
- ✅ Maintenir la persistance des données entre les sessions

## Comment réinitialiser la base de données ?

Si vous devez réinitialiser la base de données avec les données de base :

### Option 1 : Via MySQL directement
1. Connectez-vous à MySQL :
   ```bash
   mysql -u root -p
   ```
2. Sélectionnez la base de données :
   ```sql
   USE medinova;
   ```
3. Exécutez les scripts manuellement :
   ```sql
   SOURCE backend/src/main/resources/schema.sql;
   SOURCE backend/src/main/resources/data.sql;
   ```

### Option 2 : Temporairement via application.yml
1. Modifiez `application.yml` :
   ```yaml
   spring:
     sql:
       init:
         mode: always  # Active temporairement
         schema-locations: classpath:schema.sql
         data-locations: classpath:data.sql
   ```
2. Redémarrez l'application
3. **Important** : Remettez `mode: never` après le redémarrage pour éviter la réinitialisation future

### Option 3 : Via un script de réinitialisation
Créez un script SQL séparé pour la réinitialisation et exécutez-le manuellement quand nécessaire.

## Données initiales

Les scripts créent :
- 1 cabinet médical : "Cabinet Médical Central"
- 3 utilisateurs :
  - `admin` / `passwordAdmin` (ROLE_ADMIN)
  - `doctor` / `passwordDoc` (ROLE_DOCTOR)
  - `secr` / `passwordSecr` (ROLE_SECR)
- 1 abonnement PREMIUM pour le cabinet
- 5 patients de démonstration
- 10 médicaments de base
- 3 rendez-vous de démonstration

