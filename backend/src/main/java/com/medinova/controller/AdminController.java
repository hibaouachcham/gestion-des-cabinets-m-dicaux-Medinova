package com.medinova.controller;

import com.medinova.dto.*;
import com.medinova.entity.CabinetMedical;
import com.medinova.entity.Medicament;
import com.medinova.entity.Utilisateur;
import com.medinova.service.AdminService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class AdminController {
    
    private final AdminService adminService;
    
    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }
    
    @GetMapping("/cabinets")
    public ResponseEntity<List<com.medinova.dto.CabinetDTO>> getAllCabinets() {
        try {
            List<com.medinova.dto.CabinetDTO> cabinets = adminService.getAllCabinetsDTO();
            System.out.println("DEBUG: Nombre de cabinets récupérés: " + cabinets.size());
            if (!cabinets.isEmpty()) {
                System.out.println("DEBUG: Premier cabinet: " + cabinets.get(0).getNom());
            }
            return ResponseEntity.ok(cabinets);
        } catch (Exception e) {
            System.err.println("ERROR: Erreur lors de la récupération des cabinets:");
            e.printStackTrace();
            throw e;
        }
    }
    
    @PostMapping("/cabinets")
    public ResponseEntity<com.medinova.dto.CabinetDTO> createCabinet(@Valid @RequestBody com.medinova.dto.CreateCabinetRequest request) {
        // Créer le cabinet
        CabinetMedical cabinet = new CabinetMedical();
        cabinet.setNom(request.getNom());
        cabinet.setAdresse(request.getAdresse());
        cabinet.setTelephone(request.getTelephone());
        cabinet.setEmail(request.getEmail());
        cabinet.setVille(request.getVille());
        cabinet.setCodePostal(request.getCodePostal());
        
        CabinetMedical created = adminService.createCabinet(cabinet);
        
        // Créer l'abonnement si fourni
        if (request.getAbonnement() != null) {
            adminService.createAbonnement(created.getId(), request.getAbonnement());
        }
        
        com.medinova.dto.CabinetDTO dto = com.medinova.dto.CabinetDTO.fromEntity(created);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }
    
    @PutMapping("/cabinets/{id}")
    public ResponseEntity<CabinetMedical> updateCabinet(@PathVariable Long id,
                                                        @RequestBody CabinetMedical cabinet) {
        CabinetMedical updated = adminService.updateCabinet(id, cabinet);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/cabinets/{id}")
    public ResponseEntity<Map<String, String>> deleteCabinet(@PathVariable Long id) {
        adminService.deleteCabinet(id);
        Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "Cabinet supprimé avec succès");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/utilisateurs")
    public ResponseEntity<List<com.medinova.dto.UtilisateurDTO>> getAllUtilisateurs() {
        try {
            List<com.medinova.dto.UtilisateurDTO> utilisateurs = adminService.getAllUtilisateursDTO();
            return ResponseEntity.ok(utilisateurs);
        } catch (Exception e) {
            e.printStackTrace();
            throw e;
        }
    }
    
    @PostMapping("/utilisateurs")
    public ResponseEntity<Utilisateur> createUtilisateur(@RequestBody Utilisateur utilisateur) {
        Utilisateur created = adminService.createUtilisateur(utilisateur);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/utilisateurs/{id}")
    public ResponseEntity<Utilisateur> updateUtilisateur(@PathVariable Long id,
                                                          @RequestBody Utilisateur utilisateur) {
        Utilisateur updated = adminService.updateUtilisateur(id, utilisateur);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/utilisateurs/{id}")
    public ResponseEntity<Map<String, String>> deleteUtilisateur(@PathVariable Long id) {
        adminService.deleteUtilisateur(id);
        Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "Utilisateur supprimé avec succès");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/medicaments")
    public ResponseEntity<List<Medicament>> getAllMedicaments() {
        List<Medicament> medicaments = adminService.getAllMedicaments();
        return ResponseEntity.ok(medicaments);
    }
    
    @PostMapping("/medicaments/import")
    public ResponseEntity<Map<String, String>> importMedicaments(@RequestBody List<Medicament> medicaments) {
        adminService.importMedicaments(medicaments);
        Map<String, String> response = new java.util.HashMap<>();
        response.put("message", medicaments.size() + " médicaments importés");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = adminService.getStats();
        return ResponseEntity.ok(stats);
    }
    
    // ========== GESTION DES ABONNEMENTS ==========
    
    /**
     * Récupère les statistiques détaillées des abonnements
     */
    @GetMapping("/abonnements/stats")
    public ResponseEntity<SubscriptionStatsDTO> getSubscriptionStats() {
        SubscriptionStatsDTO stats = adminService.getSubscriptionStats();
        return ResponseEntity.ok(stats);
    }
    
    /**
     * Récupère tous les abonnements
     */
    @GetMapping("/abonnements")
    public ResponseEntity<List<AbonnementDTO>> getAllAbonnements() {
        List<AbonnementDTO> abonnements = adminService.getAllAbonnements();
        return ResponseEntity.ok(abonnements);
    }
    
    /**
     * Récupère l'abonnement d'un cabinet spécifique
     */
    @GetMapping("/abonnements/cabinet/{cabinetId}")
    public ResponseEntity<AbonnementDTO> getAbonnementByCabinet(@PathVariable Long cabinetId) {
        AbonnementDTO abonnement = adminService.getAbonnementByCabinetId(cabinetId);
        return ResponseEntity.ok(abonnement);
    }
    
    /**
     * Crée un abonnement pour un cabinet
     */
    @PostMapping("/abonnements/cabinet/{cabinetId}")
    public ResponseEntity<AbonnementDTO> createAbonnement(@PathVariable Long cabinetId,
                                                          @Valid @RequestBody CreateAbonnementRequest request) {
        com.medinova.entity.Abonnement abonnement = adminService.createAbonnement(cabinetId, request);
        AbonnementDTO dto = AbonnementDTO.fromEntity(abonnement);
        return ResponseEntity.status(HttpStatus.CREATED).body(dto);
    }
    
    /**
     * Met à jour un abonnement
     */
    @PutMapping("/abonnements/{abonnementId}")
    public ResponseEntity<AbonnementDTO> updateAbonnement(@PathVariable Long abonnementId,
                                                          @Valid @RequestBody CreateAbonnementRequest request) {
        com.medinova.entity.Abonnement abonnement = adminService.updateAbonnement(abonnementId, request);
        AbonnementDTO dto = AbonnementDTO.fromEntity(abonnement);
        return ResponseEntity.ok(dto);
    }
    
    /**
     * Active ou désactive un abonnement
     */
    @PatchMapping("/abonnements/{abonnementId}/toggle")
    public ResponseEntity<AbonnementDTO> toggleAbonnementStatus(@PathVariable Long abonnementId,
                                                               @RequestParam boolean actif) {
        com.medinova.entity.Abonnement abonnement = adminService.toggleAbonnementStatus(abonnementId, actif);
        AbonnementDTO dto = AbonnementDTO.fromEntity(abonnement);
        return ResponseEntity.ok(dto);
    }
    
    /**
     * Renouvelle un abonnement (prolonge la date de fin)
     */
    @PostMapping("/abonnements/{abonnementId}/renew")
    public ResponseEntity<AbonnementDTO> renewAbonnement(@PathVariable Long abonnementId,
                                                        @Valid @RequestBody RenewAbonnementRequest request) {
        com.medinova.entity.Abonnement abonnement = adminService.renewAbonnement(abonnementId, request);
        AbonnementDTO dto = AbonnementDTO.fromEntity(abonnement);
        return ResponseEntity.ok(dto);
    }
}

