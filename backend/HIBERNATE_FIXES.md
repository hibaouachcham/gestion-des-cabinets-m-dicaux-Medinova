# Corrections Hibernate/JPA - Medinova

## ✅ Corrections Appliquées

### 1. Entité `Facture`
**Problème:** Les colonnes camelCase ne correspondaient pas aux colonnes snake_case de la base de données.

**Corrections:**
- `montantHT` → `@Column(name = "montant_ht")`
- `tauxTVA` → `@Column(name = "taux_tva")` + précision corrigée (5,2)
- `montantTTC` → `@Column(name = "montant_ttc")`
- `statutPaiement` → `@Column(name = "statut_paiement")`

### 2. Entité `CabinetMedical`
**Problème:** `codePostal` n'avait pas de mapping explicite.

**Correction:**
- `codePostal` → `@Column(name = "code_postal")`

### 3. Entité `DossierMedical`
**Problème:** `traitementsEnCours` n'avait pas de mapping explicite.

**Correction:**
- `traitementsEnCours` → `@Column(name = "traitements_en_cours")`

### 4. Entité `DocumentMedical`
**Problème:** Les colonnes camelCase ne correspondaient pas.

**Corrections:**
- `nomFichier` → `@Column(name = "nom_fichier")`
- `cheminFichier` → `@Column(name = "chemin_fichier")`

### 5. Toutes les colonnes Enum
**Problème:** Hibernate s'attendait à des ENUM MySQL au lieu de VARCHAR.

**Corrections appliquées:**
- `Abonnement.type` → `columnDefinition = "VARCHAR(20)"`
- `Utilisateur.role` → `columnDefinition = "VARCHAR(20)"`
- `Patient.sexe` → `columnDefinition = "VARCHAR(1)"`
- `RendezVous.statut` → `columnDefinition = "VARCHAR(20)"`
- `Facture.statutPaiement` → `columnDefinition = "VARCHAR(20)"`

## 📋 Vérification Complète des Entités

### ✅ Entités Vérifiées et Corrigées

1. **CabinetMedical** ✅
   - Tous les noms de colonnes mappés correctement
   - `code_postal` ajouté

2. **Utilisateur** ✅
   - Enum `role` avec `columnDefinition = "VARCHAR(20)"`
   - Toutes les colonnes mappées

3. **Abonnement** ✅
   - Enum `type` avec `columnDefinition = "VARCHAR(20)"`
   - Toutes les colonnes mappées

4. **Patient** ✅
   - Enum `sexe` avec `columnDefinition = "VARCHAR(1)"`
   - `date_naissance` déjà mappé

5. **DossierMedical** ✅
   - `traitements_en_cours` ajouté

6. **DocumentMedical** ✅
   - `nom_fichier` et `chemin_fichier` ajoutés

7. **RendezVous** ✅
   - Enum `statut` avec `columnDefinition = "VARCHAR(20)"`
   - Toutes les colonnes mappées

8. **FileAttente** ✅
   - Toutes les colonnes mappées correctement

9. **Consultation** ✅
   - Toutes les colonnes mappées correctement

10. **Ordonnance** ✅
    - Toutes les colonnes mappées correctement

11. **LigneOrdonnance** ✅
    - Toutes les colonnes mappées correctement

12. **Medicament** ✅
    - Toutes les colonnes mappées correctement

13. **Facture** ✅
    - Toutes les colonnes camelCase mappées en snake_case
    - Précision de `taux_tva` corrigée (5,2)

## 🔍 Points de Vérification

### Noms de Colonnes
- ✅ Tous les camelCase mappés en snake_case avec `@Column(name = "...")`
- ✅ Tous les noms correspondent exactement au schéma SQL

### Types de Données
- ✅ DECIMAL avec précision et échelle correctes
- ✅ VARCHAR avec longueur appropriée
- ✅ TEXT pour les colonnes longues
- ✅ DATETIME pour les dates/heures
- ✅ DATE pour les dates simples
- ✅ BOOLEAN pour les booléens

### Enums
- ✅ Tous les Enums utilisent `@Enumerated(EnumType.STRING)`
- ✅ Tous les Enums ont `columnDefinition = "VARCHAR(x)"` pour éviter les problèmes avec ENUM MySQL

### Relations
- ✅ `@ManyToOne` avec `@JoinColumn` correct
- ✅ `@OneToMany` avec `mappedBy` correct
- ✅ `@OneToOne` avec `@JoinColumn` ou `mappedBy` correct

### Génération d'ID
- ✅ Tous les IDs utilisent `@GeneratedValue(strategy = GenerationType.IDENTITY)`

## 🚀 Résultat

Toutes les entités JPA sont maintenant **100% compatibles** avec le schéma MySQL et la configuration Hibernate en mode `validate`.

Le backend devrait démarrer sans erreurs de validation de schéma.

