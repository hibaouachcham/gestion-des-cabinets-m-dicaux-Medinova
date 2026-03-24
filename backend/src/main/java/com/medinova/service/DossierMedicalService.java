package com.medinova.service;

import com.medinova.dto.CreateDossierRequest;
import com.medinova.dto.DossierMedicalDTO;
import com.medinova.entity.*;
import com.medinova.repository.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DossierMedicalService {

    private final DossierMedicalRepository dossierRepository;
    private final PatientRepository patientRepository;
    private final ConsultationRepository consultationRepository;
    private final TraitementEnCoursRepository traitementRepository;
    private final DocumentMedicalRepository documentRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final String uploadDir = "./uploads/documents-medicaux";

    public DossierMedicalService(DossierMedicalRepository dossierRepository,
                                 PatientRepository patientRepository,
                                 ConsultationRepository consultationRepository,
                                 TraitementEnCoursRepository traitementRepository,
                                 DocumentMedicalRepository documentRepository,
                                 UtilisateurRepository utilisateurRepository) {
        this.dossierRepository = dossierRepository;
        this.patientRepository = patientRepository;
        this.consultationRepository = consultationRepository;
        this.traitementRepository = traitementRepository;
        this.documentRepository = documentRepository;
        this.utilisateurRepository = utilisateurRepository;
        
        // Créer le répertoire d'upload s'il n'existe pas
        try {
            Path uploadPath = Paths.get(uploadDir);
            if (!Files.exists(uploadPath)) {
                Files.createDirectories(uploadPath);
            }
        } catch (IOException e) {
            throw new RuntimeException("Impossible de créer le répertoire d'upload", e);
        }
    }

    /**
     * Vérifie si un dossier médical existe pour un patient
     */
    @Transactional(readOnly = true)
    public boolean dossierExists(Long patientId) {
        return dossierRepository.findByPatientId(patientId).isPresent();
    }

    /**
     * Récupère le dossier médical d'un patient (avec sécurité)
     */
    @Transactional(readOnly = true)
    public DossierMedicalDTO getDossierByPatientId(Long patientId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        // Vérifier que le médecin connecté peut accéder à ce patient
        verifyMedecinAccess(patient);

        DossierMedical dossier = dossierRepository.findByPatientId(patientId)
                .orElseThrow(() -> new RuntimeException("Dossier médical non trouvé pour ce patient"));

        List<Consultation> consultations = consultationRepository
                .findByPatientIdOrderByDateConsultationDesc(patientId);

        List<TraitementEnCours> traitements = traitementRepository.findByDossierId(dossier.getId());
        List<DocumentMedical> documents = documentRepository.findByDossierId(dossier.getId());

        Utilisateur medecinResponsable = dossier.getMedecinResponsable();

        return DossierMedicalDTO.fromEntities(patient, dossier, consultations, traitements, documents, medecinResponsable);
    }

    /**
     * Crée un nouveau dossier médical
     */
    public DossierMedicalDTO createDossier(CreateDossierRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        // Vérifier que le médecin connecté peut accéder à ce patient
        verifyMedecinAccess(patient);

        // Vérifier qu'un dossier n'existe pas déjà
        if (dossierRepository.findByPatientId(patient.getId()).isPresent()) {
            throw new RuntimeException("Un dossier médical existe déjà pour ce patient");
        }

        // Récupérer le médecin connecté
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur medecin = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Médecin non trouvé"));

        if (medecin.getRole() != Utilisateur.Role.ROLE_DOCTOR) {
            throw new RuntimeException("Seuls les médecins peuvent créer un dossier médical");
        }

        // Créer le dossier
        DossierMedical dossier = new DossierMedical();
        dossier.setPatient(patient);
        dossier.setMedecinResponsable(medecin);

        // Antécédents
        dossier.setMaladiesChroniques(request.getMaladiesChroniques());
        dossier.setChirurgiesAnterieures(request.getChirurgiesAnterieures());
        dossier.setHospitalisationsAnterieures(request.getHospitalisationsAnterieures());
        dossier.setAllergies(request.getAllergies());
        dossier.setAntecedentsFamiliaux(request.getAntecedentsFamiliaux());

        // Informations biologiques
        dossier.setGroupeSanguin(request.getGroupeSanguin());
        dossier.setTailleCm(request.getTailleCm());
        dossier.setPoidsKg(request.getPoidsKg());
        dossier.setConstantesBiologiques(request.getConstantesBiologiques());

        // Notes médicales
        dossier.setObservationsGlobales(request.getObservationsGlobales());
        dossier.setSuiviLongTerme(request.getSuiviLongTerme());

        DossierMedical savedDossier = dossierRepository.save(dossier);

        // Ajouter les traitements en cours
        if (request.getTraitementsEnCours() != null && !request.getTraitementsEnCours().isEmpty()) {
            List<TraitementEnCours> traitements = request.getTraitementsEnCours().stream()
                    .map(t -> {
                        TraitementEnCours traitement = new TraitementEnCours();
                        traitement.setDossier(savedDossier);
                        traitement.setNomMedicament(t.getNomMedicament());
                        traitement.setDosage(t.getDosage());
                        traitement.setFrequence(t.getFrequence());
                        traitement.setDuree(t.getDuree());
                        traitement.setNotes(t.getNotes());
                        traitement.setDateDebut(t.getDateDebut());
                        traitement.setDateFin(t.getDateFin());
                        traitement.setActif(true);
                        return traitement;
                    })
                    .collect(Collectors.toList());
            traitementRepository.saveAll(traitements);
        }

        // Récupérer les données complètes pour le DTO
        List<Consultation> consultations = consultationRepository
                .findByPatientIdOrderByDateConsultationDesc(patient.getId());
        List<TraitementEnCours> traitements = traitementRepository.findByDossierId(savedDossier.getId());
        List<DocumentMedical> documents = documentRepository.findByDossierId(savedDossier.getId());

        return DossierMedicalDTO.fromEntities(patient, savedDossier, consultations, traitements, documents, medecin);
    }

    /**
     * Met à jour un dossier médical existant
     */
    public DossierMedicalDTO updateDossier(Long dossierId, DossierMedicalDTO dto) {
        DossierMedical dossier = dossierRepository.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier médical non trouvé"));

        Patient patient = dossier.getPatient();
        verifyMedecinAccess(patient);

        // Antécédents
        dossier.setMaladiesChroniques(dto.getMaladiesChroniques());
        dossier.setChirurgiesAnterieures(dto.getChirurgiesAnterieures());
        dossier.setHospitalisationsAnterieures(dto.getHospitalisationsAnterieures());
        dossier.setAllergies(dto.getAllergies());
        dossier.setAntecedentsFamiliaux(dto.getAntecedentsFamiliaux());

        // Informations biologiques
        dossier.setGroupeSanguin(dto.getGroupeSanguin());
        dossier.setTailleCm(dto.getTailleCm());
        dossier.setPoidsKg(dto.getPoidsKg());
        dossier.setConstantesBiologiques(dto.getConstantesBiologiques());

        // Notes médicales
        dossier.setObservationsGlobales(dto.getObservationsGlobales());
        dossier.setSuiviLongTerme(dto.getSuiviLongTerme());

        DossierMedical saved = dossierRepository.save(dossier);

        // Mettre à jour les traitements
        if (dto.getTraitementsEnCours() != null) {
            // Supprimer les anciens traitements
            traitementRepository.findByDossierId(dossierId).forEach(t -> traitementRepository.delete(t));

            // Ajouter les nouveaux traitements
            dto.getTraitementsEnCours().forEach(t -> {
                TraitementEnCours traitement = new TraitementEnCours();
                traitement.setDossier(saved);
                traitement.setNomMedicament(t.getNomMedicament());
                traitement.setDosage(t.getDosage());
                traitement.setFrequence(t.getFrequence());
                traitement.setDuree(t.getDuree());
                traitement.setNotes(t.getNotes());
                traitement.setDateDebut(t.getDateDebut());
                traitement.setDateFin(t.getDateFin());
                traitement.setActif(t.getActif() != null ? t.getActif() : true);
                traitementRepository.save(traitement);
            });
        }

        List<Consultation> consultations = consultationRepository
                .findByPatientIdOrderByDateConsultationDesc(patient.getId());
        List<TraitementEnCours> traitements = traitementRepository.findByDossierId(saved.getId());
        List<DocumentMedical> documents = documentRepository.findByDossierId(saved.getId());

        return DossierMedicalDTO.fromEntities(patient, saved, consultations, traitements, documents, saved.getMedecinResponsable());
    }

    /**
     * Met à jour un dossier médical par patientId
     */
    public DossierMedicalDTO updateDossierByPatientId(Long patientId, com.medinova.dto.UpdateDossierRequest request) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));

        verifyMedecinAccess(patient);

        DossierMedical dossier = dossierRepository.findByPatientId(patientId)
                .orElseThrow(() -> new RuntimeException("Dossier médical non trouvé pour ce patient"));

        // Antécédents
        if (request.getMaladiesChroniques() != null) {
            dossier.setMaladiesChroniques(request.getMaladiesChroniques());
        }
        if (request.getChirurgiesAnterieures() != null) {
            dossier.setChirurgiesAnterieures(request.getChirurgiesAnterieures());
        }
        if (request.getHospitalisationsAnterieures() != null) {
            dossier.setHospitalisationsAnterieures(request.getHospitalisationsAnterieures());
        }
        if (request.getAllergies() != null) {
            dossier.setAllergies(request.getAllergies());
        }
        if (request.getAntecedentsFamiliaux() != null) {
            dossier.setAntecedentsFamiliaux(request.getAntecedentsFamiliaux());
        }

        // Informations biologiques
        if (request.getGroupeSanguin() != null) {
            dossier.setGroupeSanguin(request.getGroupeSanguin());
        }
        if (request.getTailleCm() != null) {
            dossier.setTailleCm(request.getTailleCm());
        }
        if (request.getPoidsKg() != null) {
            dossier.setPoidsKg(request.getPoidsKg());
        }
        if (request.getConstantesBiologiques() != null) {
            dossier.setConstantesBiologiques(request.getConstantesBiologiques());
        }

        // Notes médicales
        if (request.getObservationsGlobales() != null) {
            dossier.setObservationsGlobales(request.getObservationsGlobales());
        }
        if (request.getSuiviLongTerme() != null) {
            dossier.setSuiviLongTerme(request.getSuiviLongTerme());
        }

        DossierMedical saved = dossierRepository.save(dossier);

        // Mettre à jour les traitements
        if (request.getTraitementsEnCours() != null) {
            // Supprimer les anciens traitements
            traitementRepository.findByDossierId(dossier.getId()).forEach(t -> traitementRepository.delete(t));

            // Ajouter les nouveaux traitements
            request.getTraitementsEnCours().forEach(t -> {
                TraitementEnCours traitement = new TraitementEnCours();
                traitement.setDossier(saved);
                traitement.setNomMedicament(t.getNomMedicament());
                traitement.setDosage(t.getDosage());
                traitement.setFrequence(t.getFrequence());
                traitement.setDuree(t.getDuree());
                traitement.setNotes(t.getNotes());
                traitement.setDateDebut(t.getDateDebut());
                traitement.setDateFin(t.getDateFin());
                traitement.setActif(t.getActif() != null ? t.getActif() : true);
                traitementRepository.save(traitement);
            });
        }

        List<Consultation> consultations = consultationRepository
                .findByPatientIdOrderByDateConsultationDesc(patient.getId());
        List<TraitementEnCours> traitements = traitementRepository.findByDossierId(saved.getId());
        List<DocumentMedical> documents = documentRepository.findByDossierId(saved.getId());

        return DossierMedicalDTO.fromEntities(patient, saved, consultations, traitements, documents, saved.getMedecinResponsable());
    }

    /**
     * Ajoute un document médical au dossier
     */
    public DossierMedicalDTO addDocument(Long dossierId, MultipartFile file, String description) {
        DossierMedical dossier = dossierRepository.findById(dossierId)
                .orElseThrow(() -> new RuntimeException("Dossier médical non trouvé"));

        Patient patient = dossier.getPatient();
        verifyMedecinAccess(patient);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur uploadedBy = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        try {
            String filename = System.currentTimeMillis() + "_" + file.getOriginalFilename();
            Path filePath = Paths.get(uploadDir).resolve(filename);
            Files.copy(file.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            DocumentMedical document = new DocumentMedical();
            document.setDossier(dossier);
            document.setNomFichier(file.getOriginalFilename());
            document.setCheminFichier(filePath.toString());
            document.setType(file.getContentType());
            document.setTaille(file.getSize());
            document.setDescription(description);
            document.setUploadedBy(uploadedBy);

            documentRepository.save(document);

            // Retourner le dossier mis à jour
            List<Consultation> consultations = consultationRepository
                    .findByPatientIdOrderByDateConsultationDesc(patient.getId());
            List<TraitementEnCours> traitements = traitementRepository.findByDossierId(dossierId);
            List<DocumentMedical> documents = documentRepository.findByDossierId(dossierId);

            return DossierMedicalDTO.fromEntities(patient, dossier, consultations, traitements, documents, dossier.getMedecinResponsable());

        } catch (IOException e) {
            throw new RuntimeException("Erreur lors de l'upload du document: " + e.getMessage(), e);
        }
    }

    /**
     * Vérifie que le médecin connecté peut accéder au patient (même cabinet)
     */
    private void verifyMedecinAccess(Patient patient) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur medecin = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));

        if (medecin.getRole() != Utilisateur.Role.ROLE_DOCTOR) {
            throw new RuntimeException("Seuls les médecins peuvent accéder aux dossiers médicaux");
        }

        // Vérifier que le patient appartient au même cabinet que le médecin
        if (patient.getCabinet() == null || medecin.getCabinet() == null ||
                !patient.getCabinet().getId().equals(medecin.getCabinet().getId())) {
            throw new RuntimeException("Vous n'avez pas accès à ce patient (cabinet différent)");
        }
    }
}