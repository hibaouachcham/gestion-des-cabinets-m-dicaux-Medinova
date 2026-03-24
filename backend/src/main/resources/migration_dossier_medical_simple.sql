-- Migration simplifiée pour enrichir le système de dossier médical
-- Version compatible avec MySQL qui ne supporte pas IF NOT EXISTS dans ALTER TABLE

USE medinova;

-- 1. Ajouter les nouvelles colonnes à la table dossiers_medicaux (sans IF NOT EXISTS)
-- Si une colonne existe déjà, vous obtiendrez une erreur - ignorez-la

ALTER TABLE dossiers_medicaux
ADD COLUMN medecin_responsable_id BIGINT NULL AFTER patient_id;

ALTER TABLE dossiers_medicaux
ADD COLUMN maladies_chroniques TEXT NULL AFTER patient_id;

ALTER TABLE dossiers_medicaux
ADD COLUMN chirurgies_anterieures TEXT NULL AFTER maladies_chroniques;

ALTER TABLE dossiers_medicaux
ADD COLUMN hospitalisations_anterieures TEXT NULL AFTER chirurgies_anterieures;

ALTER TABLE dossiers_medicaux
ADD COLUMN antecedents_familiaux TEXT NULL AFTER allergies;

ALTER TABLE dossiers_medicaux
ADD COLUMN groupe_sanguin VARCHAR(10) NULL AFTER antecedents_familiaux;

ALTER TABLE dossiers_medicaux
ADD COLUMN taille_cm DECIMAL(5,2) NULL AFTER groupe_sanguin;

ALTER TABLE dossiers_medicaux
ADD COLUMN poids_kg DECIMAL(5,2) NULL AFTER taille_cm;

ALTER TABLE dossiers_medicaux
ADD COLUMN constantes_biologiques TEXT NULL AFTER poids_kg;

ALTER TABLE dossiers_medicaux
ADD COLUMN observations_globales TEXT NULL AFTER constantes_biologiques;

ALTER TABLE dossiers_medicaux
ADD COLUMN suivi_long_terme TEXT NULL AFTER observations_globales;

-- 2. Ajouter la contrainte de clé étrangère pour medecin_responsable_id
-- Vérifier d'abord si la contrainte existe déjà
ALTER TABLE dossiers_medicaux
ADD CONSTRAINT FK_dossier_medecin_responsable
FOREIGN KEY (medecin_responsable_id) REFERENCES utilisateurs(id)
ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3. Créer la table traitements_en_cours
CREATE TABLE IF NOT EXISTS traitements_en_cours (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dossier_id BIGINT NOT NULL,
    nom_medicament VARCHAR(200) NOT NULL,
    dosage VARCHAR(100) NULL,
    frequence VARCHAR(100) NULL,
    duree VARCHAR(100) NULL,
    notes TEXT NULL,
    date_debut DATE NULL,
    date_fin DATE NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NULL DEFAULT NULL ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT FK_traitement_dossier FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 4. Créer des index pour améliorer les performances
CREATE INDEX idx_traitement_dossier ON traitements_en_cours(dossier_id);
CREATE INDEX idx_traitement_actif ON traitements_en_cours(actif);

