-- Migration pour enrichir le système de dossier médical
-- À exécuter manuellement dans MySQL avant de relancer le backend

USE medinova;

-- 1. Ajouter les nouvelles colonnes à la table dossiers_medicaux
ALTER TABLE dossiers_medicaux
ADD COLUMN IF NOT EXISTS medecin_responsable_id BIGINT NULL AFTER patient_id,
ADD COLUMN IF NOT EXISTS maladies_chroniques TEXT NULL AFTER patient_id,
ADD COLUMN IF NOT EXISTS chirurgies_anterieures TEXT NULL AFTER maladies_chroniques,
ADD COLUMN IF NOT EXISTS hospitalisations_anterieures TEXT NULL AFTER chirurgies_anterieures,
ADD COLUMN IF NOT EXISTS antecedents_familiaux TEXT NULL AFTER allergies,
ADD COLUMN IF NOT EXISTS groupe_sanguin VARCHAR(10) NULL AFTER antecedents_familiaux,
ADD COLUMN IF NOT EXISTS taille_cm DECIMAL(5,2) NULL AFTER groupe_sanguin,
ADD COLUMN IF NOT EXISTS poids_kg DECIMAL(5,2) NULL AFTER taille_cm,
ADD COLUMN IF NOT EXISTS constantes_biologiques TEXT NULL AFTER poids_kg,
ADD COLUMN IF NOT EXISTS observations_globales TEXT NULL AFTER constantes_biologiques,
ADD COLUMN IF NOT EXISTS suivi_long_terme TEXT NULL AFTER observations_globales;

-- 2. Ajouter la contrainte de clé étrangère pour medecin_responsable_id
ALTER TABLE dossiers_medicaux
ADD CONSTRAINT FK_dossier_medecin_responsable
FOREIGN KEY (medecin_responsable_id) REFERENCES utilisateurs(id)
ON DELETE RESTRICT ON UPDATE CASCADE;

-- 3. Rendre medecin_responsable_id NOT NULL (après avoir rempli les valeurs existantes)
-- ATTENTION: Exécuter cette commande seulement après avoir rempli les valeurs pour les dossiers existants
-- UPDATE dossiers_medicaux SET medecin_responsable_id = (SELECT id FROM utilisateurs WHERE role = 'ROLE_DOCTOR' LIMIT 1) WHERE medecin_responsable_id IS NULL;
-- ALTER TABLE dossiers_medicaux MODIFY COLUMN medecin_responsable_id BIGINT NOT NULL;

-- 4. Créer la table traitements_en_cours
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

-- 5. Créer un index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_traitement_dossier ON traitements_en_cours(dossier_id);
CREATE INDEX IF NOT EXISTS idx_traitement_actif ON traitements_en_cours(actif);

