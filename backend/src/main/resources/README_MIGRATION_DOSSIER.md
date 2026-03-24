# Migration - Enrichissement du système de dossier médical

## 🔴 Problème

Lors du démarrage du backend, Hibernate en mode `validate` détecte que le schéma de la base de données ne correspond pas aux nouvelles entités :
- Nouvelles colonnes dans `dossiers_medicaux` (maladies_chroniques, chirurgies_anterieures, etc.)
- Nouvelle table `traitements_en_cours`

## ✅ Solution

Exécuter le script SQL de migration **AVANT** de relancer le backend.

## 📋 Étapes

### Option 1 : Via MySQL Workbench ou ligne de commande MySQL

1. Ouvrir MySQL Workbench ou un terminal MySQL
2. Se connecter à la base de données `medinova`
3. Exécuter le script `migration_dossier_medical_simple.sql` :

```bash
mysql -u root -p medinova < backend/src/main/resources/migration_dossier_medical_simple.sql
```

Ou copier-coller le contenu du fichier dans MySQL Workbench et exécuter.

### Option 2 : Via MySQL Workbench (interface graphique)

1. Ouvrir MySQL Workbench
2. Se connecter à votre serveur MySQL
3. Sélectionner la base de données `medinova`
4. Ouvrir le fichier `backend/src/main/resources/migration_dossier_medical_simple.sql`
5. Exécuter le script (Ctrl+Shift+Enter ou bouton "Execute")

### Option 3 : Via phpMyAdmin ou autre outil

1. Ouvrir phpMyAdmin
2. Sélectionner la base de données `medinova`
3. Aller dans l'onglet "SQL"
4. Copier-coller le contenu de `migration_dossier_medical_simple.sql`
5. Cliquer sur "Exécuter"

## ⚠️ Notes importantes

- Si vous obtenez une erreur "Column already exists", c'est normal - la colonne existe déjà, vous pouvez ignorer cette erreur
- Si vous obtenez une erreur "Constraint already exists", c'est normal aussi - la contrainte existe déjà
- Le script est idempotent : vous pouvez l'exécuter plusieurs fois sans problème

## 🔍 Vérification

Après avoir exécuté le script, vérifiez que :

1. La table `traitements_en_cours` existe :
```sql
SHOW TABLES LIKE 'traitements_en_cours';
```

2. Les nouvelles colonnes existent dans `dossiers_medicaux` :
```sql
DESCRIBE dossiers_medicaux;
```

Vous devriez voir les colonnes :
- `medecin_responsable_id`
- `maladies_chroniques`
- `chirurgies_anterieures`
- `hospitalisations_anterieures`
- `antecedents_familiaux`
- `groupe_sanguin`
- `taille_cm`
- `poids_kg`
- `constantes_biologiques`
- `observations_globales`
- `suivi_long_terme`

## 🚀 Après la migration

Une fois la migration exécutée, vous pouvez relancer le backend :

```bash
cd backend
mvn spring-boot:run
```

Le backend devrait démarrer sans erreurs de validation Hibernate.

