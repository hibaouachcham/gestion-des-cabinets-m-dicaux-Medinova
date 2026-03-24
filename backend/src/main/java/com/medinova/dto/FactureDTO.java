package com.medinova.dto;

import com.medinova.entity.Facture;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FactureDTO {
    private Long id;
    private String numero;
    private Long patientId;
    private String patientNom;
    private String patientPrenom;
    private String patientCin;
    private Long consultationId;
    private BigDecimal montantHT;
    private BigDecimal tauxTVA;
    private BigDecimal montantTTC;
    private Facture.StatutPaiement statutPaiement;
    private LocalDateTime dateEmission;
    private LocalDateTime datePaiement;
    private String notes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static FactureDTO fromEntity(Facture facture) {
        FactureDTO dto = new FactureDTO();
        dto.setId(facture.getId());
        dto.setNumero(facture.getNumero());
        
        if (facture.getPatient() != null) {
            dto.setPatientId(facture.getPatient().getId());
            dto.setPatientNom(facture.getPatient().getNom());
            dto.setPatientPrenom(facture.getPatient().getPrenom());
            dto.setPatientCin(facture.getPatient().getCin());
        }
        
        if (facture.getConsultation() != null) {
            dto.setConsultationId(facture.getConsultation().getId());
        }
        
        dto.setMontantHT(facture.getMontantHT());
        dto.setTauxTVA(facture.getTauxTVA());
        dto.setMontantTTC(facture.getMontantTTC());
        dto.setStatutPaiement(facture.getStatutPaiement());
        dto.setDateEmission(facture.getDateEmission());
        dto.setDatePaiement(facture.getDatePaiement());
        dto.setNotes(facture.getNotes());
        dto.setCreatedAt(facture.getCreatedAt());
        dto.setUpdatedAt(facture.getUpdatedAt());
        
        return dto;
    }
}

