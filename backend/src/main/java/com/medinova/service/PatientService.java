package com.medinova.service;

import com.medinova.dto.PatientDTO;
import com.medinova.entity.DossierMedical;
import com.medinova.entity.FileAttente;
import com.medinova.entity.Patient;
import com.medinova.entity.Utilisateur;
import com.medinova.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;

import java.util.Optional;

@Service
@Transactional
public class PatientService {
    
    private final PatientRepository patientRepository;
    private final CabinetMedicalRepository cabinetRepository;
    private final DossierMedicalRepository dossierRepository;
    private final FileAttenteRepository fileAttenteRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final ConsultationRepository consultationRepository;
    
    @PersistenceContext
    private EntityManager entityManager;
    
    public PatientService(PatientRepository patientRepository,
                         CabinetMedicalRepository cabinetRepository,
                         DossierMedicalRepository dossierRepository,
                         FileAttenteRepository fileAttenteRepository,
                         UtilisateurRepository utilisateurRepository,
                         ConsultationRepository consultationRepository) {
        this.patientRepository = patientRepository;
        this.cabinetRepository = cabinetRepository;
        this.dossierRepository = dossierRepository;
        this.fileAttenteRepository = fileAttenteRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.consultationRepository = consultationRepository;
    }
    
    @Transactional(readOnly = true)
    public Page<PatientDTO> searchPatients(String search, Pageable pageable) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur user = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        Long cabinetId = user.getCabinet() != null ? user.getCabinet().getId() : null;
        Page<Patient> patients = patientRepository.searchPatients(search, cabinetId, pageable);
        
        // Assigner automatiquement les patients sans cabinet au cabinet de l'utilisateur connecté
        if (user.getCabinet() != null) {
            patients.getContent().forEach(patient -> {
                if (patient.getCabinet() == null) {
                    patient.setCabinet(user.getCabinet());
                    patientRepository.save(patient);
                    System.out.println("DEBUG: Patient ID=" + patient.getId() + " assigné au cabinet ID=" + user.getCabinet().getId());
                }
            });
        }
        
        return patients.map(patient -> {
            PatientDTO dto = PatientDTO.fromEntity(patient);
            // Vérifier si le patient est déjà en file d'attente
            // Utiliser la méthode exists pour être plus efficace
            boolean enFileAttente = fileAttenteRepository.existsByPatientIdAndDateTraitementIsNull(patient.getId());
            dto.setEnFileAttente(enFileAttente);
            System.out.println("DEBUG PatientService.searchPatients: Patient ID=" + patient.getId() + 
                             " (" + patient.getNom() + " " + patient.getPrenom() + ") - enFileAttente = " + enFileAttente);
            return dto;
        });
    }
    
    @Transactional(readOnly = true)
    public PatientDTO getPatientById(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé avec l'id: " + id));
        PatientDTO dto = PatientDTO.fromEntity(patient);
        // Vérifier si le patient est déjà en file d'attente
        boolean enFileAttente = fileAttenteRepository.findByPatientIdAndDateTraitementIsNull(patient.getId()).isPresent();
        dto.setEnFileAttente(enFileAttente);
        return dto;
    }
    
    public PatientDTO createPatient(PatientDTO dto) {
        if (patientRepository.existsByCin(dto.getCin())) {
            throw new RuntimeException("Un patient avec ce CIN existe déjà");
        }
        
        // Récupérer l'utilisateur connecté pour assigner automatiquement le cabinet
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur user = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        Patient patient = new Patient();
        patient.setCin(dto.getCin());
        patient.setNom(dto.getNom());
        patient.setPrenom(dto.getPrenom());
        patient.setDateNaissance(dto.getDateNaissance());
        patient.setTelephone(dto.getTelephone());
        patient.setEmail(dto.getEmail());
        patient.setAdresse(dto.getAdresse());
        patient.setVille(dto.getVille());
        patient.setSexe(dto.getSexe());
        
        // Assigner le cabinet : priorité au cabinetId du DTO, sinon utiliser le cabinet de l'utilisateur connecté
        if (dto.getCabinetId() != null) {
            patient.setCabinet(cabinetRepository.findById(dto.getCabinetId())
                    .orElseThrow(() -> new RuntimeException("Cabinet non trouvé")));
        } else if (user.getCabinet() != null) {
            // Assigner automatiquement le cabinet de l'utilisateur connecté (secrétaire ou médecin)
            patient.setCabinet(user.getCabinet());
        } else {
            throw new RuntimeException("Impossible de créer un patient : aucun cabinet assigné");
        }
        
        Patient saved = patientRepository.save(patient);
        
        // Créer le dossier médical
        DossierMedical dossier = new DossierMedical();
        dossier.setPatient(saved);
        dossierRepository.save(dossier);
        
        return PatientDTO.fromEntity(saved);
    }
    
    public PatientDTO updatePatient(Long id, PatientDTO dto) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé avec l'id: " + id));
        
        patient.setNom(dto.getNom());
        patient.setPrenom(dto.getPrenom());
        patient.setDateNaissance(dto.getDateNaissance());
        patient.setTelephone(dto.getTelephone());
        patient.setEmail(dto.getEmail());
        patient.setAdresse(dto.getAdresse());
        patient.setVille(dto.getVille());
        patient.setSexe(dto.getSexe());
        
        Patient updated = patientRepository.save(patient);
        return PatientDTO.fromEntity(updated);
    }
    
    /**
     * Supprime un patient (admin ou secrétaire/médecin de son cabinet)
     */
    public void deletePatient(Long id) {
        Patient patient = patientRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé avec l'id: " + id));
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur user = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Admin peut tout supprimer
        if (user.getRole() == Utilisateur.Role.ROLE_ADMIN) {
            patientRepository.delete(patient);
            return;
        }
        
        // Secrétaire / Médecin :
        // - si le patient a un cabinet, il doit correspondre à celui de l'utilisateur
        // - si le patient n'a PAS de cabinet (donnée orpheline / ancienne), on autorise quand même la suppression
        if (user.getCabinet() != null) {
            if (patient.getCabinet() != null &&
                    !user.getCabinet().getId().equals(patient.getCabinet().getId())) {
                throw new RuntimeException("Vous n'avez pas le droit de supprimer ce patient (cabinet différent)");
            }
        }
        
        patientRepository.delete(patient);
    }
    
    public void enqueuePatient(Long patientId) {
        enqueuePatient(patientId, null);
    }
    
    public void enqueuePatient(Long patientId, Long medecinId) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        
        // Vérifier si déjà en file d'attente
        if (fileAttenteRepository.findByPatientIdAndDateTraitementIsNull(patientId).isPresent()) {
            throw new RuntimeException("Le patient est déjà en file d'attente");
        }
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur user = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        System.out.println("DEBUG enqueuePatient: Utilisateur = " + user.getUsername() + ", Rôle = " + user.getRole());
        
        Utilisateur medecin;
        if (user.getRole() == Utilisateur.Role.ROLE_DOCTOR) {
            // Si c'est un médecin, utiliser l'utilisateur connecté
            medecin = user;
            System.out.println("DEBUG: Médecin connecté utilisé");
        } else if (user.getRole() == Utilisateur.Role.ROLE_SECR) {
            // Si c'est une secrétaire, récupérer le médecin de son cabinet
            System.out.println("DEBUG: Secrétaire détectée, recherche du médecin du cabinet");
            if (user.getCabinet() == null) {
                throw new RuntimeException("La secrétaire n'est pas affectée à un cabinet");
            }
            System.out.println("DEBUG: Cabinet ID = " + user.getCabinet().getId());
            java.util.List<Utilisateur> medecins = utilisateurRepository.findByCabinetId(user.getCabinet().getId())
                    .stream()
                    .filter(u -> u.getRole() == Utilisateur.Role.ROLE_DOCTOR)
                    .collect(java.util.stream.Collectors.toList());
            System.out.println("DEBUG: Nombre de médecins trouvés = " + medecins.size());
            if (medecins.isEmpty()) {
                throw new RuntimeException("Aucun médecin trouvé dans votre cabinet");
            }
            medecin = medecins.get(0); // Prendre le premier médecin du cabinet
            System.out.println("DEBUG: Médecin sélectionné = " + medecin.getUsername());
        } else {
            throw new RuntimeException("Seuls les médecins et secrétaires peuvent envoyer des patients en file d'attente");
        }
        
        // Vérifier que le patient appartient au même cabinet que la secrétaire/médecin
        if (patient.getCabinet() == null || !patient.getCabinet().getId().equals(medecin.getCabinet().getId())) {
            throw new RuntimeException("Le patient n'appartient pas à votre cabinet");
        }
        
        // Calculer la position en fonction du nombre de patients en attente pour ce médecin
        java.util.List<FileAttente> enAttentePourMedecin = fileAttenteRepository.findEnAttenteByMedecin(medecin.getId());
        Integer position = enAttentePourMedecin.size() + 1;
        
        FileAttente fileAttente = new FileAttente();
        fileAttente.setPatient(patient);
        fileAttente.setMedecin(medecin);
        fileAttente.setPosition(position);
        
        FileAttente saved = fileAttenteRepository.save(fileAttente);
        // Forcer le flush pour s'assurer que la sauvegarde est immédiate
        entityManager.flush();
        entityManager.refresh(saved);
        
        System.out.println("DEBUG enqueuePatient: FileAttente sauvegardée - ID=" + saved.getId() + 
                         ", Patient ID=" + saved.getPatient().getId() + 
                         ", Médecin ID=" + saved.getMedecin().getId() + 
                         ", Position=" + saved.getPosition() +
                         ", DateTraitement=" + saved.getDateTraitement());
        
        // Vérifier immédiatement que c'est bien sauvegardé
        Optional<FileAttente> verification = fileAttenteRepository.findByPatientIdAndDateTraitementIsNull(patientId);
        System.out.println("DEBUG enqueuePatient: Vérification après sauvegarde - trouvé: " + verification.isPresent());
        if (verification.isPresent()) {
            System.out.println("DEBUG enqueuePatient: FileAttente vérifiée - ID=" + verification.get().getId());
        }
    }
    
    @Transactional(readOnly = true)
    public PatientDTO getCurrentPatientInQueue() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur medecin = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        java.util.List<FileAttente> enAttente = fileAttenteRepository.findEnAttenteByMedecin(medecin.getId());
        if (enAttente.isEmpty()) {
            return null;
        }
        
        // Retourner le premier patient en attente SANS modifier son statut
        // Le statut sera modifié quand le médecin commence réellement la consultation
        FileAttente current = enAttente.get(0);
        return PatientDTO.fromEntity(current.getPatient());
    }
    
    /**
     * Marque un patient comme étant en cours de consultation
     * Cette méthode est appelée quand le médecin commence une consultation
     */
    @Transactional
    public void startConsultation(Long patientId) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur medecin = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Trouver l'entrée de file d'attente pour ce patient et ce médecin
        java.util.Optional<FileAttente> fileAttenteOpt = fileAttenteRepository
                .findByPatientIdAndDateTraitementIsNull(patientId);
        
        if (fileAttenteOpt.isPresent()) {
            FileAttente fileAttente = fileAttenteOpt.get();
            // Vérifier que c'est bien pour ce médecin
            if (fileAttente.getMedecin() != null && fileAttente.getMedecin().getId().equals(medecin.getId())) {
                // Marquer comme en traitement (mais ne pas retirer de la file encore)
                // On le retire seulement quand la consultation est terminée
                fileAttente.setDateTraitement(java.time.LocalDateTime.now());
                fileAttenteRepository.save(fileAttente);
            }
        }
    }
    
    /**
     * Retire un patient de la file d'attente
     * Cette méthode est appelée quand une consultation est terminée
     */
    @Transactional
    public void removePatientFromQueue(Long patientId) {
        java.util.Optional<FileAttente> fileAttenteOpt = fileAttenteRepository
                .findByPatientIdAndDateTraitementIsNull(patientId);
        
        if (fileAttenteOpt.isPresent()) {
            FileAttente fileAttente = fileAttenteOpt.get();
            // Marquer comme traité pour le retirer de la file
            fileAttente.setDateTraitement(java.time.LocalDateTime.now());
            fileAttenteRepository.save(fileAttente);
        }
    }
    
    /**
     * Récupère tous les patients en file d'attente pour le médecin connecté avec leurs statuts
     */
    @Transactional(readOnly = true)
    public java.util.List<com.medinova.dto.FileAttenteDTO> getAllPatientsInQueue() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur medecin = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Récupérer toutes les entrées de file d'attente pour ce médecin (même celles traitées)
        java.util.List<FileAttente> allFiles = fileAttenteRepository.findAll()
                .stream()
                .filter(f -> f.getMedecin() != null && f.getMedecin().getId().equals(medecin.getId()))
                .sorted((f1, f2) -> {
                    // Trier : d'abord par dateTraitement (null en premier), puis par position
                    if (f1.getDateTraitement() == null && f2.getDateTraitement() != null) return -1;
                    if (f1.getDateTraitement() != null && f2.getDateTraitement() == null) return 1;
                    if (f1.getDateTraitement() == null && f2.getDateTraitement() == null) {
                        return f1.getPosition().compareTo(f2.getPosition());
                    }
                    // Si les deux sont traités, trier par dateTraitement décroissante (plus récent en premier)
                    return f2.getDateTraitement().compareTo(f1.getDateTraitement());
                })
                .collect(java.util.stream.Collectors.toList());
        
        // Pour chaque entrée, déterminer le statut
        return allFiles.stream()
                .map(file -> {
                    String statut;
                    Long consultationId = null;
                    
                    if (file.getDateTraitement() == null) {
                        statut = "EN_ATTENTE";
                    } else {
                        // Vérifier si une consultation a été créée pour ce patient après dateTraitement
                        // On va chercher la consultation la plus récente pour ce patient
                        java.util.Optional<com.medinova.entity.Consultation> consultationOpt = 
                            consultationRepository.findByPatientIdOrderByDateConsultationDesc(file.getPatient().getId())
                                .stream()
                                .filter(c -> c.getDateConsultation() != null && 
                                           c.getDateConsultation().isAfter(file.getDateTraitement().minusMinutes(5)))
                                .findFirst();
                        
                        if (consultationOpt.isPresent()) {
                            statut = "TERMINE";
                            consultationId = consultationOpt.get().getId();
                        } else {
                            statut = "EN_CONSULTATION";
                        }
                    }
                    
                    return com.medinova.dto.FileAttenteDTO.fromEntity(file, statut, consultationId);
                })
                .collect(java.util.stream.Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public java.util.List<Utilisateur> getMedecinsDuCabinet() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur user = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        if (user.getCabinet() == null) {
            return java.util.Collections.emptyList();
        }
        
        return utilisateurRepository.findByCabinetId(user.getCabinet().getId())
                .stream()
                .filter(u -> u.getRole() == Utilisateur.Role.ROLE_DOCTOR)
                .collect(java.util.stream.Collectors.toList());
    }
    
    /**
     * Récupère le médecin du cabinet de l'utilisateur connecté (pour secrétaire)
     */
    @Transactional(readOnly = true)
    public Utilisateur getMedecinDuCabinet() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur user = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        if (user.getCabinet() == null) {
            throw new RuntimeException("Vous n'êtes pas affecté à un cabinet");
        }
        
        java.util.List<Utilisateur> medecins = utilisateurRepository.findByCabinetId(user.getCabinet().getId())
                .stream()
                .filter(u -> u.getRole() == Utilisateur.Role.ROLE_DOCTOR)
                .collect(java.util.stream.Collectors.toList());
        
        if (medecins.isEmpty()) {
            throw new RuntimeException("Aucun médecin trouvé dans votre cabinet");
        }
        
        return medecins.get(0);
    }
    
    /**
     * Recherche un patient par CIN ou nom (pour médecin)
     */
    @Transactional(readOnly = true)
    public java.util.List<PatientDTO> searchPatientByCinOrName(String cin, String nom) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur user = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        Long cabinetId = user.getCabinet() != null ? user.getCabinet().getId() : null;
        
        java.util.List<Patient> patients;
        if (cin != null && !cin.trim().isEmpty()) {
            // Recherche exacte par CIN
            Optional<Patient> patientOpt = patientRepository.findByCin(cin.trim());
            if (patientOpt.isPresent()) {
                Patient p = patientOpt.get();
                // Vérifier que le patient appartient au même cabinet
                if (cabinetId == null || (p.getCabinet() != null && p.getCabinet().getId().equals(cabinetId))) {
                    patients = java.util.Collections.singletonList(p);
                } else {
                    patients = java.util.Collections.emptyList();
                }
            } else {
                patients = java.util.Collections.emptyList();
            }
        } else if (nom != null && !nom.trim().isEmpty()) {
            // Recherche par nom (pagination limitée à 20 résultats)
            Page<Patient> page = patientRepository.searchPatients(nom.trim(), cabinetId, 
                    org.springframework.data.domain.PageRequest.of(0, 20));
            patients = page.getContent();
        } else {
            patients = java.util.Collections.emptyList();
        }
        
        return patients.stream()
                .map(PatientDTO::fromEntity)
                .collect(java.util.stream.Collectors.toList());
    }
}