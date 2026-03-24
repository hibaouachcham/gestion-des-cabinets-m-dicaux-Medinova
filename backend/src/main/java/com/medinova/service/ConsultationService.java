package com.medinova.service;

import com.medinova.dto.ConsultationDTO;
import com.medinova.dto.CreateConsultationRequest;
import com.medinova.entity.Consultation;
import com.medinova.entity.FileAttente;
import com.medinova.entity.Patient;
import com.medinova.entity.RendezVous;
import com.medinova.entity.Utilisateur;
import com.medinova.repository.ConsultationRepository;
import com.medinova.repository.FileAttenteRepository;
import com.medinova.repository.PatientRepository;
import com.medinova.repository.RendezVousRepository;
import com.medinova.repository.UtilisateurRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@Transactional
public class ConsultationService {
    
    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final RendezVousRepository rendezVousRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final FileAttenteRepository fileAttenteRepository;
    
    public ConsultationService(ConsultationRepository consultationRepository,
                              PatientRepository patientRepository,
                              RendezVousRepository rendezVousRepository,
                              UtilisateurRepository utilisateurRepository,
                              FileAttenteRepository fileAttenteRepository) {
        this.consultationRepository = consultationRepository;
        this.patientRepository = patientRepository;
        this.rendezVousRepository = rendezVousRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.fileAttenteRepository = fileAttenteRepository;
    }
    
    public ConsultationDTO createConsultation(CreateConsultationRequest request) {
        Patient patient = patientRepository.findById(request.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur medecin = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        Consultation consultation = new Consultation();
        consultation.setPatient(patient);
        consultation.setMedecin(medecin);
        consultation.setMotif(request.getMotif());
        consultation.setExamenClinique(request.getExamenClinique());
        consultation.setDiagnostic(request.getDiagnostic());
        consultation.setPrescription(request.getPrescription());
        consultation.setObservations(request.getObservations());
        
        if (request.getRendezVousId() != null) {
            RendezVous rdv = rendezVousRepository.findById(request.getRendezVousId())
                    .orElse(null);
            if (rdv != null) {
                consultation.setRendezVous(rdv);
                rdv.setStatut(RendezVous.Statut.TERMINE);
                rendezVousRepository.save(rdv);
            }
        }
        
        Consultation saved = consultationRepository.save(consultation);
        
        // Retirer le patient de la file d'attente maintenant que la consultation est créée
        Optional<FileAttente> fileAttenteOpt = fileAttenteRepository
                .findByPatientIdAndDateTraitementIsNull(request.getPatientId());
        
        if (fileAttenteOpt.isPresent()) {
            FileAttente fileAttente = fileAttenteOpt.get();
            // Vérifier que c'est bien pour ce médecin
            if (fileAttente.getMedecin() != null && fileAttente.getMedecin().getId().equals(medecin.getId())) {
                // Marquer comme traité pour le retirer de la file
                fileAttente.setDateTraitement(LocalDateTime.now());
                fileAttenteRepository.save(fileAttente);
            }
        }
        
        return ConsultationDTO.fromEntity(saved);
    }
    
    @Transactional(readOnly = true)
    public ConsultationDTO getConsultationById(Long id) {
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation non trouvée"));
        return ConsultationDTO.fromEntity(consultation);
    }
    
    @Transactional(readOnly = true)
    public List<ConsultationDTO> getConsultationsByPatient(Long patientId) {
        List<Consultation> consultations = consultationRepository.findByPatientIdOrderByDateConsultationDesc(patientId);
        return consultations.stream()
                .map(ConsultationDTO::fromEntity)
                .toList();
    }
    
    /**
     * Récupère toutes les consultations du médecin connecté
     */
    @Transactional(readOnly = true)
    public List<ConsultationDTO> getAllConsultationsByDoctor() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur medecin = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        List<Consultation> consultations = consultationRepository.findByMedecinIdOrderByDateConsultationDesc(medecin.getId());
        return consultations.stream()
                .map(ConsultationDTO::fromEntity)
                .toList();
    }
    
    /**
     * Met à jour une consultation existante
     * Seul le médecin qui a créé la consultation peut la modifier
     */
    public ConsultationDTO updateConsultation(Long id, com.medinova.dto.UpdateConsultationRequest request) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur medecin = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation non trouvée"));
        
        // Vérifier que le médecin connecté est bien celui qui a créé la consultation
        if (!consultation.getMedecin().getId().equals(medecin.getId())) {
            throw new RuntimeException("Vous n'avez pas le droit de modifier cette consultation");
        }
        
        // Mettre à jour les champs
        if (request.getMotif() != null) {
            consultation.setMotif(request.getMotif());
        }
        if (request.getExamenClinique() != null) {
            consultation.setExamenClinique(request.getExamenClinique());
        }
        if (request.getDiagnostic() != null) {
            consultation.setDiagnostic(request.getDiagnostic());
        }
        if (request.getPrescription() != null) {
            consultation.setPrescription(request.getPrescription());
        }
        if (request.getObservations() != null) {
            consultation.setObservations(request.getObservations());
        }
        
        Consultation updated = consultationRepository.save(consultation);
        return ConsultationDTO.fromEntity(updated);
    }
    
    /**
     * Supprime une consultation
     * Seul le médecin qui a créé la consultation peut la supprimer
     * ATTENTION: Cela supprimera aussi les ordonnances et examens associés (cascade)
     */
    public void deleteConsultation(Long id) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur medecin = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        Consultation consultation = consultationRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Consultation non trouvée"));
        
        // Vérifier que le médecin connecté est bien celui qui a créé la consultation
        if (!consultation.getMedecin().getId().equals(medecin.getId())) {
            throw new RuntimeException("Vous n'avez pas le droit de supprimer cette consultation");
        }
        
        // Supprimer la consultation (les ordonnances et examens seront supprimés en cascade)
        consultationRepository.delete(consultation);
    }
}