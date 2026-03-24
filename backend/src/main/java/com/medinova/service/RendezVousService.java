package com.medinova.service;

import com.medinova.dto.RendezVousDTO;
import com.medinova.entity.Patient;
import com.medinova.entity.RendezVous;
import com.medinova.entity.Utilisateur;
import com.medinova.repository.PatientRepository;
import com.medinova.repository.RendezVousRepository;
import com.medinova.repository.UtilisateurRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
@Transactional
public class RendezVousService {
    
    private final RendezVousRepository rendezVousRepository;
    private final PatientRepository patientRepository;
    private final UtilisateurRepository utilisateurRepository;
    
    public RendezVousService(RendezVousRepository rendezVousRepository,
                            PatientRepository patientRepository,
                            UtilisateurRepository utilisateurRepository) {
        this.rendezVousRepository = rendezVousRepository;
        this.patientRepository = patientRepository;
        this.utilisateurRepository = utilisateurRepository;
    }
    
    @Transactional(readOnly = true)
    public Page<RendezVousDTO> getRendezVous(LocalDateTime from, LocalDateTime to, Pageable pageable) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur user = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        Long medecinId = null;
        if (user.getRole() == Utilisateur.Role.ROLE_DOCTOR) {
            // Le médecin voit ses propres rendez-vous
            medecinId = user.getId();
        } else if (user.getRole() == Utilisateur.Role.ROLE_SECR) {
            // La secrétaire voit les rendez-vous du médecin de son cabinet
            if (user.getCabinet() == null) {
                throw new RuntimeException("Vous n'êtes pas affecté à un cabinet");
            }
            java.util.List<Utilisateur> medecins = utilisateurRepository.findByCabinetId(user.getCabinet().getId())
                    .stream()
                    .filter(u -> u.getRole() == Utilisateur.Role.ROLE_DOCTOR)
                    .collect(java.util.stream.Collectors.toList());
            if (!medecins.isEmpty()) {
                medecinId = medecins.get(0).getId();
            }
        }
        
        Page<RendezVous> rdv = rendezVousRepository.findByDateRange(from, to, medecinId, pageable);
        return rdv.map(RendezVousDTO::fromEntity);
    }
    
    @Transactional(readOnly = true)
    public RendezVousDTO getRendezVousById(Long id) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé"));
        return RendezVousDTO.fromEntity(rdv);
    }
    
    public RendezVousDTO createRendezVous(RendezVousDTO dto) {
        Patient patient = patientRepository.findById(dto.getPatientId())
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur user = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        Utilisateur medecin;
        com.medinova.entity.CabinetMedical userCabinet = null;
        
        if (user.getRole() == Utilisateur.Role.ROLE_DOCTOR) {
            // Le médecin crée un rendez-vous pour lui-même
            medecin = user;
            userCabinet = user.getCabinet();
        } else if (user.getRole() == Utilisateur.Role.ROLE_SECR) {
            // La secrétaire crée un rendez-vous pour le médecin de son cabinet
            if (user.getCabinet() == null) {
                throw new RuntimeException("Vous n'êtes pas affecté à un cabinet");
            }
            userCabinet = user.getCabinet();
            java.util.List<Utilisateur> medecins = utilisateurRepository.findByCabinetId(user.getCabinet().getId())
                    .stream()
                    .filter(u -> u.getRole() == Utilisateur.Role.ROLE_DOCTOR)
                    .collect(java.util.stream.Collectors.toList());
            if (medecins.isEmpty()) {
                throw new RuntimeException("Aucun médecin trouvé dans votre cabinet");
            }
            medecin = medecins.get(0);
        } else {
            throw new RuntimeException("Seuls les médecins et secrétaires peuvent créer des rendez-vous");
        }
        
        // Assigner automatiquement le cabinet au patient s'il n'en a pas
        if (patient.getCabinet() == null && userCabinet != null) {
            patient.setCabinet(userCabinet);
            patientRepository.save(patient);
            System.out.println("DEBUG: Patient ID=" + patient.getId() + " assigné au cabinet ID=" + userCabinet.getId() + " lors de la création du rendez-vous");
        }
        
        // Vérifier que le patient appartient au même cabinet que l'utilisateur (secrétaire ou médecin)
        if (patient.getCabinet() == null || userCabinet == null) {
            throw new RuntimeException("Impossible de créer le rendez-vous : cabinet non défini");
        }
        
        if (!patient.getCabinet().getId().equals(userCabinet.getId())) {
            throw new RuntimeException("Le patient n'appartient pas à votre cabinet");
        }
        
        RendezVous rdv = new RendezVous();
        rdv.setPatient(patient);
        rdv.setMedecin(medecin);
        rdv.setDateHeure(dto.getDateHeure());
        rdv.setMotif(dto.getMotif());
        rdv.setNotes(dto.getNotes());
        rdv.setStatut(dto.getStatut() != null ? dto.getStatut() : RendezVous.Statut.PLANIFIE);
        
        RendezVous saved = rendezVousRepository.save(rdv);
        return RendezVousDTO.fromEntity(saved);
    }
    
    public RendezVousDTO updateRendezVous(Long id, RendezVousDTO dto) {
        RendezVous rdv = rendezVousRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Rendez-vous non trouvé"));
        
        // Mettre à jour seulement les champs qui sont fournis (non-null)
        if (dto.getDateHeure() != null) {
            rdv.setDateHeure(dto.getDateHeure());
        }
        if (dto.getMotif() != null) {
            rdv.setMotif(dto.getMotif());
        }
        if (dto.getNotes() != null) {
            rdv.setNotes(dto.getNotes());
        }
        if (dto.getStatut() != null) {
            rdv.setStatut(dto.getStatut());
        }
        
        if (dto.getPatientId() != null && !rdv.getPatient().getId().equals(dto.getPatientId())) {
            rdv.setPatient(patientRepository.findById(dto.getPatientId())
                    .orElseThrow(() -> new RuntimeException("Patient non trouvé")));
        }
        
        RendezVous updated = rendezVousRepository.save(rdv);
        return RendezVousDTO.fromEntity(updated);
    }
    
    public void deleteRendezVous(Long id) {
        if (!rendezVousRepository.existsById(id)) {
            throw new RuntimeException("Rendez-vous non trouvé");
        }
        rendezVousRepository.deleteById(id);
    }
}

