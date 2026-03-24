package com.medinova.service;

import com.medinova.dto.FactureDTO;
import com.medinova.entity.Consultation;
import com.medinova.entity.Facture;
import com.medinova.entity.Patient;
import com.medinova.entity.Utilisateur;
import com.medinova.repository.ConsultationRepository;
import com.medinova.repository.FactureRepository;
import com.medinova.repository.PatientRepository;
import com.medinova.repository.UtilisateurRepository;
import com.medinova.util.PDFGenerator;
import java.util.stream.Collectors;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;

@Service
@Transactional
public class FactureService {
    
    private final FactureRepository factureRepository;
    private final PatientRepository patientRepository;
    private final ConsultationRepository consultationRepository;
    private final UtilisateurRepository utilisateurRepository;
    private final PDFGenerator pdfGenerator;
    
    @Value("${medinova.pdf.output-dir:./pdf-output}")
    private String pdfOutputDir;
    
    public FactureService(FactureRepository factureRepository,
                         PatientRepository patientRepository,
                         ConsultationRepository consultationRepository,
                         UtilisateurRepository utilisateurRepository,
                         PDFGenerator pdfGenerator) {
        this.factureRepository = factureRepository;
        this.patientRepository = patientRepository;
        this.consultationRepository = consultationRepository;
        this.utilisateurRepository = utilisateurRepository;
        this.pdfGenerator = pdfGenerator;
    }
    
    public FactureDTO createFacture(Long patientId, Long consultationId,
                                BigDecimal montantHT, BigDecimal tauxTVA,
                                String notes) {
        Patient patient = patientRepository.findById(patientId)
                .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
        
        // Vérifier que l'utilisateur a le droit de créer une facture pour ce patient
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur user = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        if (user.getRole() == Utilisateur.Role.ROLE_SECR || user.getRole() == Utilisateur.Role.ROLE_DOCTOR) {
            // Vérifier que le patient appartient au même cabinet
            if (patient.getCabinet() == null || user.getCabinet() == null ||
                !patient.getCabinet().getId().equals(user.getCabinet().getId())) {
                throw new RuntimeException("Le patient n'appartient pas à votre cabinet");
            }
        }
        
        Facture facture = new Facture();
        facture.setPatient(patient);
        facture.setMontantHT(montantHT != null ? montantHT : BigDecimal.ZERO);
        facture.setTauxTVA(tauxTVA != null ? tauxTVA : BigDecimal.valueOf(0.20));
        facture.setNotes(notes);
        
        if (consultationId != null) {
            Consultation consultation = consultationRepository.findById(consultationId)
                    .orElse(null);
            facture.setConsultation(consultation);
        }
        
        // Calcul automatique du montant TTC
        facture.setMontantTTC(
                facture.getMontantHT().multiply(BigDecimal.ONE.add(facture.getTauxTVA()))
        );
        
        Facture saved = factureRepository.save(facture);
        // Recharger avec les relations pour le DTO
        saved = factureRepository.findByIdWithRelations(saved.getId())
                .orElseThrow(() -> new RuntimeException("Erreur lors de la récupération de la facture"));
        return FactureDTO.fromEntity(saved);
    }
    
    @Transactional(readOnly = true)
    public Page<FactureDTO> getFactures(Long patientId, LocalDateTime from,
                                     LocalDateTime to, Pageable pageable) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur user = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        Long cabinetId = null;
        if (user.getRole() == Utilisateur.Role.ROLE_SECR || user.getRole() == Utilisateur.Role.ROLE_DOCTOR) {
            // La secrétaire et le médecin ne voient que les factures de leur cabinet
            if (user.getCabinet() != null) {
                cabinetId = user.getCabinet().getId();
            }
        }
        // L'admin voit toutes les factures (cabinetId reste null)
        
        Page<Facture> factures = factureRepository.findByFilters(patientId, cabinetId, from, to, pageable);
        return factures.map(FactureDTO::fromEntity);
    }
    
    @Transactional(readOnly = true)
    public Facture getFactureById(Long id) {
        return factureRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));
    }
    
    @Transactional(readOnly = true)
    public FactureDTO getFactureDTOById(Long id) {
        Facture facture = factureRepository.findByIdWithRelations(id)
                .orElseThrow(() -> new RuntimeException("Facture non trouvée"));
        return FactureDTO.fromEntity(facture);
    }
    
    /**
     * Supprime une facture (admin ou secrétaire/médecin de son cabinet)
     */
    public void deleteFacture(Long id) {
        Facture facture = getFactureById(id);
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur user = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Admin peut tout supprimer
        if (user.getRole() == Utilisateur.Role.ROLE_ADMIN) {
            factureRepository.delete(facture);
            return;
        }
        
        // Secrétaire / Médecin : uniquement si la facture est du même cabinet
        if (user.getCabinet() == null ||
                facture.getPatient() == null ||
                facture.getPatient().getCabinet() == null ||
                !user.getCabinet().getId().equals(facture.getPatient().getCabinet().getId())) {
            throw new RuntimeException("Vous n'avez pas le droit de supprimer cette facture (cabinet différent)");
        }
        
        factureRepository.delete(facture);
    }
    
    public Resource generatePDF(Long factureId) {
        Facture facture = getFactureById(factureId);
        
        try {
            String filename = "facture_" + factureId + ".pdf";
            Path pdfPath = Paths.get(pdfOutputDir).resolve(filename);
            pdfPath.getParent().toFile().mkdirs();
            
            pdfGenerator.generateFacturePDF(facture, pdfPath.toString());
            
            Resource resource = new UrlResource(pdfPath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Le fichier PDF n'a pas pu être généré");
            }
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF: " + e.getMessage(), e);
        }
    }
    
    public FactureDTO updateStatutPaiement(Long id, Facture.StatutPaiement statut) {
        Facture facture = getFactureById(id);
        facture.setStatutPaiement(statut);
        if (statut == Facture.StatutPaiement.PAYE) {
            facture.setDatePaiement(LocalDateTime.now());
        }
        Facture saved = factureRepository.save(facture);
        // Recharger avec les relations pour le DTO
        saved = factureRepository.findByIdWithRelations(saved.getId())
                .orElseThrow(() -> new RuntimeException("Erreur lors de la récupération de la facture"));
        return FactureDTO.fromEntity(saved);
    }
}

