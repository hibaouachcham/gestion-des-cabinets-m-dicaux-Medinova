-- Données d'exemple pour Medinova

-- Insertion d'un cabinet médical
INSERT INTO cabinets_medicaux (nom, adresse, telephone, email, ville, code_postal) 
VALUES ('Cabinet Médical Central', '123 Rue de la Santé', '0612345678', 'contact@cabinet-central.ma', 'Casablanca', '20000');

-- Récupération de l'ID du cabinet créé
SET @cabinet_id = LAST_INSERT_ID();

-- Insertion des utilisateurs (mots de passe hashés avec BCrypt)
-- passwordAdmin -> $2a$10$PwHqTTXIkB3JTRmo3uaHK.a1EIOZrIygwo3qCbmwUjrJSSBSKp.Oi
-- passwordDoc -> $2a$10$HBsxNMT/LxQadl0ngxZjfu9Ah4s82kxGYNhLQ/rsXM8zGe.kmf/Xm
-- passwordSecr -> $2a$10$SGZVkGA6R5WYZREMc545RedFJvIvAG68NWkSFkBajzZzlFDM9K8/e

INSERT INTO utilisateurs (username, password, nom, prenom, email, telephone, role, cabinet_id, active) 
VALUES 
('admin', '$2a$10$PwHqTTXIkB3JTRmo3uaHK.a1EIOZrIygwo3qCbmwUjrJSSBSKp.Oi', 'Administrateur', 'Système', 'admin@cabinet-central.ma', '0611111111', 'ROLE_ADMIN', @cabinet_id, TRUE),
('doctor', '$2a$10$HBsxNMT/LxQadl0ngxZjfu9Ah4s82kxGYNhLQ/rsXM8zGe.kmf/Xm', 'Benali', 'Ahmed', 'doctor@cabinet-central.ma', '0622222222', 'ROLE_DOCTOR', @cabinet_id, TRUE),
('secr', '$2a$10$SGZVkGA6R5WYZREMc545RedFJvIvAG68NWkSFkBajzZzlFDM9K8/e', 'Alami', 'Fatima', 'secr@cabinet-central.ma', '0633333333', 'ROLE_SECR', @cabinet_id, TRUE);

-- Insertion d'un abonnement
INSERT INTO abonnements (cabinet_id, type, date_debut, date_fin, actif) 
VALUES (@cabinet_id, 'PREMIUM', CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), TRUE);

-- Récupération de l'ID du médecin
SET @doctor_id = (SELECT id FROM utilisateurs WHERE username = 'doctor');

-- Insertion de patients
INSERT INTO patients (cin, nom, prenom, date_naissance, telephone, email, adresse, ville, sexe, cabinet_id) 
VALUES 
('AB123456', 'Tazi', 'Mohammed', '1985-03-15', '0644444444', 'm.tazi@email.com', '45 Rue Hassan II', 'Casablanca', 'M', @cabinet_id),
('CD789012', 'Idrissi', 'Aicha', '1990-07-22', '0655555555', 'a.idrissi@email.com', '12 Avenue Mohammed V', 'Rabat', 'F', @cabinet_id),
('EF345678', 'Berrada', 'Youssef', '1978-11-08', '0666666666', 'y.berrada@email.com', '78 Boulevard Zerktouni', 'Casablanca', 'M', @cabinet_id),
('GH901234', 'Bennani', 'Khadija', '1995-01-30', '0677777777', 'k.bennani@email.com', '23 Rue Allal Ben Abdellah', 'Fès', 'F', @cabinet_id),
('IJ567890', 'Alaoui', 'Hassan', '1988-05-17', '0688888888', 'h.alaoui@email.com', '56 Avenue My Rachid', 'Marrakech', 'M', @cabinet_id);

-- Création des dossiers médicaux pour chaque patient
INSERT INTO dossiers_medicaux (patient_id, antecedents, allergies, traitements_en_cours, observations) 
SELECT id, 
    CASE 
        WHEN cin = 'AB123456' THEN 'Hypertension artérielle depuis 2015'
        WHEN cin = 'CD789012' THEN 'Asthme léger'
        WHEN cin = 'EF345678' THEN 'Diabète type 2'
        ELSE NULL
    END,
    CASE 
        WHEN cin = 'AB123456' THEN 'Pénicilline'
        WHEN cin = 'CD789012' THEN 'Acariens, Pollen'
        ELSE NULL
    END,
    CASE 
        WHEN cin = 'AB123456' THEN 'Lisinopril 10mg/jour'
        WHEN cin = 'EF345678' THEN 'Metformine 1000mg/jour'
        ELSE NULL
    END,
    NULL
FROM patients 
WHERE cabinet_id = @cabinet_id;

-- Insertion de médicaments
INSERT INTO medicaments (code, nom, forme, dosage, description, prix, disponible) 
VALUES 
('MED001', 'Paracétamol', 'Comprimé', '500mg', 'Antalgique et antipyrétique', 15.50, TRUE),
('MED002', 'Amoxicilline', 'Gélule', '500mg', 'Antibiotique à large spectre', 45.00, TRUE),
('MED003', 'Ibuprofène', 'Comprimé', '400mg', 'Anti-inflammatoire non stéroïdien', 28.75, TRUE),
('MED004', 'Lisinopril', 'Comprimé', '10mg', 'Inhibiteur de l''enzyme de conversion', 62.00, TRUE),
('MED005', 'Metformine', 'Comprimé', '1000mg', 'Antidiabétique oral', 58.50, TRUE),
('MED006', 'Ventoline', 'Aérosol', '100mcg/dose', 'Bronchodilatateur', 85.00, TRUE),
('MED007', 'Aspirine', 'Comprimé', '100mg', 'Antiplaquettaire et antalgique', 12.25, TRUE),
('MED008', 'Oméprazole', 'Gélule', '20mg', 'Inhibiteur de la pompe à protons', 38.90, TRUE),
('MED009', 'Ciprofloxacine', 'Comprimé', '500mg', 'Antibiotique fluoroquinolone', 52.30, TRUE),
('MED010', 'Doliprane', 'Comprimé', '1000mg', 'Paracétamol', 18.75, TRUE);

-- Insertion de quelques rendez-vous
SET @patient1_id = (SELECT id FROM patients WHERE cin = 'AB123456');
SET @patient2_id = (SELECT id FROM patients WHERE cin = 'CD789012');
SET @patient3_id = (SELECT id FROM patients WHERE cin = 'EF345678');

INSERT INTO rendez_vous (patient_id, medecin_id, date_heure, motif, statut) 
VALUES 
(@patient1_id, @doctor_id, DATE_ADD(NOW(), INTERVAL 2 DAY), 'Consultation de suivi - Hypertension', 'PLANIFIE'),
(@patient2_id, @doctor_id, DATE_ADD(NOW(), INTERVAL 5 DAY), 'Contrôle asthme', 'PLANIFIE'),
(@patient3_id, @doctor_id, DATE_ADD(NOW(), INTERVAL 1 DAY), 'Suivi diabète', 'PLANIFIE');

-- Note: Les consultations, ordonnances et factures seront créées via l'application

