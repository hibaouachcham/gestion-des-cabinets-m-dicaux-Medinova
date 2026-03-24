package com.medinova.service;

import com.medinova.dto.*;
import com.medinova.entity.Abonnement;
import com.medinova.entity.CabinetMedical;
import com.medinova.entity.Medicament;
import com.medinova.entity.Utilisateur;
import com.medinova.repository.AbonnementRepository;
import com.medinova.repository.CabinetMedicalRepository;
import com.medinova.repository.MedicamentRepository;
import com.medinova.repository.UtilisateurRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@Transactional
public class AdminService {
    
    private final CabinetMedicalRepository cabinetRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final MedicamentRepository medicamentRepository;
    private final AbonnementRepository abonnementRepository;
    private final PasswordEncoder passwordEncoder;
    
    public AdminService(CabinetMedicalRepository cabinetRepository,
                       UtilisateurRepository utilisateurRepository,
                       MedicamentRepository medicamentRepository,
                       AbonnementRepository abonnementRepository,
                       PasswordEncoder passwordEncoder) {
        this.cabinetRepository = cabinetRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.medicamentRepository = medicamentRepository;
        this.abonnementRepository = abonnementRepository;
        this.passwordEncoder = passwordEncoder;
    }
    
    @Transactional(readOnly = true)
    public List<CabinetMedical> getAllCabinets() {
        return cabinetRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public List<com.medinova.dto.CabinetDTO> getAllCabinetsDTO() {
        List<CabinetMedical> cabinets = cabinetRepository.findAll();
        System.out.println("DEBUG AdminService: Nombre de cabinets trouvés en base: " + cabinets.size());
        if (!cabinets.isEmpty()) {
            System.out.println("DEBUG AdminService: Premier cabinet en base: " + cabinets.get(0).getNom() + " (ID: " + cabinets.get(0).getId() + ")");
        }
        List<com.medinova.dto.CabinetDTO> dtos = cabinets.stream()
                .map(com.medinova.dto.CabinetDTO::fromEntity)
                .collect(Collectors.toList());
        System.out.println("DEBUG AdminService: Nombre de DTOs créés: " + dtos.size());
        return dtos;
    }
    
    public CabinetMedical createCabinet(CabinetMedical cabinet) {
        CabinetMedical saved = cabinetRepository.save(cabinet);
        return saved;
    }
    
    /**
     * Crée un cabinet avec un abonnement initial
     */
    public CabinetMedical createCabinetWithAbonnement(CabinetMedical cabinet, CreateAbonnementRequest abonnementRequest) {
        CabinetMedical saved = cabinetRepository.save(cabinet);
        
        // Créer l'abonnement associé
        Abonnement abonnement = new Abonnement();
        abonnement.setCabinet(saved);
        abonnement.setType(abonnementRequest.getType());
        abonnement.setDateDebut(abonnementRequest.getDateDebut());
        abonnement.setDateFin(abonnementRequest.getDateFin());
        abonnement.setActif(abonnementRequest.isActif());
        abonnementRepository.save(abonnement);
        
        return saved;
    }
    
    public CabinetMedical updateCabinet(Long id, CabinetMedical cabinet) {
        CabinetMedical existing = cabinetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cabinet non trouvé"));
        
        existing.setNom(cabinet.getNom());
        existing.setAdresse(cabinet.getAdresse());
        existing.setTelephone(cabinet.getTelephone());
        existing.setEmail(cabinet.getEmail());
        existing.setVille(cabinet.getVille());
        existing.setCodePostal(cabinet.getCodePostal());
        
        return cabinetRepository.save(existing);
    }
    
    public void deleteCabinet(Long id) {
        CabinetMedical cabinet = cabinetRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Cabinet non trouvé"));
        cabinetRepository.delete(cabinet);
    }
    
    @Transactional(readOnly = true)
    public List<Utilisateur> getAllUtilisateurs() {
        return utilisateurRepository.findAll();
    }
    
    @Transactional(readOnly = true)
    public List<com.medinova.dto.UtilisateurDTO> getAllUtilisateursDTO() {
        // findAll() avec @EntityGraph charge automatiquement le cabinet
        List<Utilisateur> utilisateurs = utilisateurRepository.findAll();
        return utilisateurs.stream()
                .map(utilisateur -> {
                    com.medinova.dto.UtilisateurDTO dto = com.medinova.dto.UtilisateurDTO.fromEntity(utilisateur);
                    // S'assurer que le cabinet est chargé
                    if (utilisateur.getCabinet() != null) {
                        dto.setCabinetId(utilisateur.getCabinet().getId());
                        dto.setCabinetNom(utilisateur.getCabinet().getNom());
                    }
                    return dto;
                })
                .collect(Collectors.toList());
    }
    
    public Utilisateur createUtilisateur(Utilisateur utilisateur) {
        if (utilisateurRepository.existsByUsername(utilisateur.getUsername())) {
            throw new RuntimeException("Ce nom d'utilisateur existe déjà");
        }

        // Pour les rôles DOCTOR et SECR, un cabinet est obligatoire
        if ((utilisateur.getRole() == Utilisateur.Role.ROLE_DOCTOR ||
             utilisateur.getRole() == Utilisateur.Role.ROLE_SECR) &&
            utilisateur.getCabinet() == null) {
            throw new RuntimeException("Pour un médecin ou une secrétaire, vous devez affecter un cabinet.");
        }

        // Hasher le mot de passe avant de sauvegarder
        if (utilisateur.getPassword() != null && !utilisateur.getPassword().isEmpty()) {
            utilisateur.setPassword(passwordEncoder.encode(utilisateur.getPassword()));
        }
        return utilisateurRepository.save(utilisateur);
    }
    
    public Utilisateur updateUtilisateur(Long id, Utilisateur utilisateur) {
        Utilisateur existing = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Vérifier si le nouveau username n'est pas déjà utilisé par un autre utilisateur
        if (!existing.getUsername().equals(utilisateur.getUsername()) && 
            utilisateurRepository.existsByUsername(utilisateur.getUsername())) {
            throw new RuntimeException("Ce nom d'utilisateur existe déjà");
        }
        
        existing.setUsername(utilisateur.getUsername());
        existing.setNom(utilisateur.getNom());
        existing.setPrenom(utilisateur.getPrenom());
        existing.setEmail(utilisateur.getEmail());
        existing.setTelephone(utilisateur.getTelephone());
        existing.setRole(utilisateur.getRole());
        existing.setCabinet(utilisateur.getCabinet());
        existing.setActive(utilisateur.isActive());
        
        // Ne mettre à jour le mot de passe que s'il est fourni et différent
        if (utilisateur.getPassword() != null && !utilisateur.getPassword().isEmpty() && 
            !passwordEncoder.matches(utilisateur.getPassword(), existing.getPassword())) {
            // Hasher le nouveau mot de passe
            existing.setPassword(passwordEncoder.encode(utilisateur.getPassword()));
        }
        
        return utilisateurRepository.save(existing);
    }
    
    public void deleteUtilisateur(Long id) {
        Utilisateur utilisateur = utilisateurRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        utilisateurRepository.delete(utilisateur);
    }
    
    @Transactional(readOnly = true)
    public List<Medicament> getAllMedicaments() {
        return medicamentRepository.findAll();
    }
    
    public void importMedicaments(List<Medicament> medicaments) {
        for (Medicament m : medicaments) {
            if (!medicamentRepository.existsByCode(m.getCode())) {
                medicamentRepository.save(m);
            }
        }
    }
    
    @Transactional(readOnly = true)
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalCabinets", cabinetRepository.count());
        stats.put("totalUtilisateurs", utilisateurRepository.count());
        stats.put("totalMedicaments", medicamentRepository.count());
        return stats;
    }
    
    // ========== GESTION DES ABONNEMENTS ==========
    
    /**
     * Crée un abonnement pour un cabinet
     */
    public Abonnement createAbonnement(Long cabinetId, CreateAbonnementRequest request) {
        CabinetMedical cabinet = cabinetRepository.findById(cabinetId)
                .orElseThrow(() -> new RuntimeException("Cabinet non trouvé"));
        
        // Vérifier si un abonnement existe déjà
        abonnementRepository.findByCabinetId(cabinetId).ifPresent(ab -> {
            throw new RuntimeException("Ce cabinet possède déjà un abonnement");
        });
        
        Abonnement abonnement = new Abonnement();
        abonnement.setCabinet(cabinet);
        abonnement.setType(request.getType());
        abonnement.setDateDebut(request.getDateDebut());
        abonnement.setDateFin(request.getDateFin());
        abonnement.setActif(request.isActif());
        
        return abonnementRepository.save(abonnement);
    }
    
    /**
     * Met à jour un abonnement existant
     */
    public Abonnement updateAbonnement(Long abonnementId, CreateAbonnementRequest request) {
        Abonnement abonnement = abonnementRepository.findById(abonnementId)
                .orElseThrow(() -> new RuntimeException("Abonnement non trouvé"));
        
        abonnement.setType(request.getType());
        abonnement.setDateDebut(request.getDateDebut());
        abonnement.setDateFin(request.getDateFin());
        abonnement.setActif(request.isActif());
        
        return abonnementRepository.save(abonnement);
    }
    
    /**
     * Active ou désactive un abonnement
     */
    public Abonnement toggleAbonnementStatus(Long abonnementId, boolean actif) {
        Abonnement abonnement = abonnementRepository.findById(abonnementId)
                .orElseThrow(() -> new RuntimeException("Abonnement non trouvé"));
        
        abonnement.setActif(actif);
        return abonnementRepository.save(abonnement);
    }
    
    /**
     * Renouvelle un abonnement (prolonge la date de fin)
     */
    public Abonnement renewAbonnement(Long abonnementId, RenewAbonnementRequest request) {
        Abonnement abonnement = abonnementRepository.findById(abonnementId)
                .orElseThrow(() -> new RuntimeException("Abonnement non trouvé"));
        
        abonnement.setDateFin(request.getNouvelleDateFin());
        abonnement.setActif(request.isActiver());
        
        return abonnementRepository.save(abonnement);
    }
    
    /**
     * Récupère tous les abonnements avec leurs détails
     */
    @Transactional(readOnly = true)
    public List<AbonnementDTO> getAllAbonnements() {
        List<Abonnement> abonnements = abonnementRepository.findAll();
        return abonnements.stream().map(ab -> {
            AbonnementDTO dto = AbonnementDTO.fromEntity(ab);
            // Récupérer le médecin associé au cabinet
            List<Utilisateur> medecins = utilisateurRepository.findByCabinetId(ab.getCabinet().getId())
                    .stream()
                    .filter(u -> u.getRole() == Utilisateur.Role.ROLE_DOCTOR)
                    .collect(Collectors.toList());
            if (!medecins.isEmpty()) {
                Utilisateur medecin = medecins.get(0);
                dto.setMedecinNom(medecin.getNom());
                dto.setMedecinPrenom(medecin.getPrenom());
            }
            return dto;
        }).collect(Collectors.toList());
    }
    
    /**
     * Récupère les statistiques détaillées des abonnements
     */
    @Transactional(readOnly = true)
    public SubscriptionStatsDTO getSubscriptionStats() {
        LocalDate aujourdhui = LocalDate.now();
        LocalDate dateAlerte = aujourdhui.plusDays(15);
        
        long totalCabinets = cabinetRepository.count();
        long totalAbonnements = abonnementRepository.count();
        long abonnementsActifs = abonnementRepository.countActiveSubscriptions(aujourdhui);
        long abonnementsExpires = abonnementRepository.countExpiredSubscriptions(aujourdhui);
        long abonnementsARenouveler = abonnementRepository.countSubscriptionsExpiringSoon(aujourdhui, dateAlerte);
        
        // Récupérer tous les abonnements avec détails
        List<AbonnementDTO> abonnements = getAllAbonnements();
        
        SubscriptionStatsDTO stats = new SubscriptionStatsDTO();
        stats.setTotalCabinets(totalCabinets);
        stats.setTotalAbonnements(totalAbonnements);
        stats.setAbonnementsActifs(abonnementsActifs);
        stats.setAbonnementsExpires(abonnementsExpires);
        stats.setAbonnementsARenouveler(abonnementsARenouveler);
        stats.setAbonnements(abonnements);
        
        return stats;
    }
    
    /**
     * Récupère un abonnement par ID de cabinet
     */
    @Transactional(readOnly = true)
    public AbonnementDTO getAbonnementByCabinetId(Long cabinetId) {
        Abonnement abonnement = abonnementRepository.findByCabinetId(cabinetId)
                .orElseThrow(() -> new RuntimeException("Aucun abonnement trouvé pour ce cabinet"));
        
        AbonnementDTO dto = AbonnementDTO.fromEntity(abonnement);
        // Récupérer le médecin associé
        List<Utilisateur> medecins = utilisateurRepository.findByCabinetId(cabinetId)
                .stream()
                .filter(u -> u.getRole() == Utilisateur.Role.ROLE_DOCTOR)
                .collect(Collectors.toList());
        if (!medecins.isEmpty()) {
            Utilisateur medecin = medecins.get(0);
            dto.setMedecinNom(medecin.getNom());
            dto.setMedecinPrenom(medecin.getPrenom());
        }
        return dto;
    }
    
    /**
     * Vérifie si un cabinet a un abonnement actif
     */
    @Transactional(readOnly = true)
    public boolean isCabinetSubscriptionActive(Long cabinetId) {
        return abonnementRepository.findByCabinetId(cabinetId)
                .map(Abonnement::isActif)
                .orElse(false);
    }
}

