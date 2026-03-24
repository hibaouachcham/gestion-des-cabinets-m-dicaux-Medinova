-- Schema SQL pour Medinova

-- Suppression des tables si elles existent (pour réinitialisation)
SET FOREIGN_KEY_CHECKS = 0;
DROP TABLE IF EXISTS lignes_ordonnance;
DROP TABLE IF EXISTS ordonnances;
DROP TABLE IF EXISTS factures;
DROP TABLE IF EXISTS consultations;
DROP TABLE IF EXISTS documents_medicaux;
DROP TABLE IF EXISTS dossiers_medicaux;
DROP TABLE IF EXISTS rendez_vous;
DROP TABLE IF EXISTS file_attente;
DROP TABLE IF EXISTS patients;
DROP TABLE IF EXISTS abonnements;
DROP TABLE IF EXISTS utilisateurs;
DROP TABLE IF EXISTS cabinets_medicaux;
DROP TABLE IF EXISTS medicaments;
SET FOREIGN_KEY_CHECKS = 1;

-- Table: cabinets_medicaux
CREATE TABLE cabinets_medicaux (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nom VARCHAR(200) NOT NULL,
    adresse VARCHAR(500) NOT NULL,
    telephone VARCHAR(20),
    email VARCHAR(100),
    ville VARCHAR(50),
    code_postal VARCHAR(10),
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Table: utilisateurs
CREATE TABLE utilisateurs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    email VARCHAR(100),
    telephone VARCHAR(20),
    role VARCHAR(20) NOT NULL,
    cabinet_id BIGINT,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cabinet_id) REFERENCES cabinets_medicaux(id) ON DELETE SET NULL,
    INDEX idx_username (username),
    INDEX idx_role (role)
);

-- Table: abonnements
CREATE TABLE abonnements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cabinet_id BIGINT NOT NULL UNIQUE,
    type VARCHAR(20) NOT NULL,
    date_debut DATE NOT NULL,
    date_fin DATE NOT NULL,
    actif BOOLEAN NOT NULL DEFAULT TRUE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (cabinet_id) REFERENCES cabinets_medicaux(id) ON DELETE CASCADE
);

-- Table: patients
CREATE TABLE patients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cin VARCHAR(20) NOT NULL UNIQUE,
    nom VARCHAR(100) NOT NULL,
    prenom VARCHAR(100) NOT NULL,
    date_naissance DATE,
    telephone VARCHAR(20),
    email VARCHAR(100),
    adresse VARCHAR(500),
    ville VARCHAR(50),
    sexe VARCHAR(1),
    cabinet_id BIGINT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (cabinet_id) REFERENCES cabinets_medicaux(id) ON DELETE SET NULL,
    INDEX idx_cin (cin),
    INDEX idx_nom_prenom (nom, prenom)
);

-- Table: dossiers_medicaux
CREATE TABLE dossiers_medicaux (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL UNIQUE,
    antecedents TEXT,
    allergies TEXT,
    traitements_en_cours TEXT,
    observations TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE
);

-- Table: documents_medicaux
CREATE TABLE documents_medicaux (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    dossier_id BIGINT NOT NULL,
    nom_fichier VARCHAR(255) NOT NULL,
    chemin_fichier VARCHAR(500) NOT NULL,
    type VARCHAR(100),
    taille BIGINT,
    description TEXT,
    uploaded_by BIGINT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dossier_id) REFERENCES dossiers_medicaux(id) ON DELETE CASCADE,
    FOREIGN KEY (uploaded_by) REFERENCES utilisateurs(id) ON DELETE SET NULL
);

-- Table: rendez_vous
CREATE TABLE rendez_vous (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    medecin_id BIGINT,
    date_heure DATETIME NOT NULL,
    motif TEXT,
    statut VARCHAR(20) NOT NULL DEFAULT 'PLANIFIE',
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (medecin_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    INDEX idx_date_heure (date_heure),
    INDEX idx_statut (statut)
);

-- Table: file_attente
CREATE TABLE file_attente (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL UNIQUE,
    medecin_id BIGINT,
    position INT NOT NULL,
    date_ajout DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_traitement DATETIME,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (medecin_id) REFERENCES utilisateurs(id) ON DELETE SET NULL,
    INDEX idx_position (position),
    INDEX idx_date_traitement (date_traitement)
);

-- Table: consultations
CREATE TABLE consultations (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    patient_id BIGINT NOT NULL,
    medecin_id BIGINT NOT NULL,
    rendez_vous_id BIGINT,
    date_consultation DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    motif TEXT,
    examen_clinique TEXT,
    diagnostic TEXT,
    prescription TEXT,
    observations TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (medecin_id) REFERENCES utilisateurs(id) ON DELETE CASCADE,
    FOREIGN KEY (rendez_vous_id) REFERENCES rendez_vous(id) ON DELETE SET NULL,
    INDEX idx_date_consultation (date_consultation)
);

-- Table: medicaments
CREATE TABLE medicaments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(50) NOT NULL UNIQUE,
    nom VARCHAR(200) NOT NULL,
    forme VARCHAR(100),
    dosage VARCHAR(100),
    description TEXT,
    prix DECIMAL(10, 2),
    disponible BOOLEAN NOT NULL DEFAULT TRUE,
    INDEX idx_nom (nom),
    INDEX idx_code (code)
);

-- Table: ordonnances
CREATE TABLE ordonnances (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    consultation_id BIGINT NOT NULL,
    medecin_id BIGINT NOT NULL,
    instructions TEXT,
    date_emission DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE CASCADE,
    FOREIGN KEY (medecin_id) REFERENCES utilisateurs(id) ON DELETE CASCADE
);

-- Table: lignes_ordonnance
CREATE TABLE lignes_ordonnance (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ordonnance_id BIGINT NOT NULL,
    medicament_id BIGINT NOT NULL,
    quantite INT NOT NULL,
    posologie TEXT,
    duree TEXT,
    FOREIGN KEY (ordonnance_id) REFERENCES ordonnances(id) ON DELETE CASCADE,
    FOREIGN KEY (medicament_id) REFERENCES medicaments(id) ON DELETE CASCADE
);

-- Table: factures
CREATE TABLE factures (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    numero VARCHAR(50) NOT NULL UNIQUE,
    patient_id BIGINT NOT NULL,
    consultation_id BIGINT,
    montant_ht DECIMAL(10, 2) NOT NULL,
    taux_tva DECIMAL(5, 2) NOT NULL DEFAULT 0.20,
    montant_ttc DECIMAL(10, 2) NOT NULL,
    statut_paiement VARCHAR(20) NOT NULL DEFAULT 'IMPAYE',
    date_emission DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    date_paiement DATETIME,
    notes TEXT,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (patient_id) REFERENCES patients(id) ON DELETE CASCADE,
    FOREIGN KEY (consultation_id) REFERENCES consultations(id) ON DELETE SET NULL,
    INDEX idx_numero (numero),
    INDEX idx_date_emission (date_emission)
);

