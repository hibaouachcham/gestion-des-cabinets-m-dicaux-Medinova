package com.medinova.dto;

import com.medinova.entity.ExamenComplementaire;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamenComplementaireDTO {
    private Long id;
    private Long consultationId;
    private Long medecinId;
    private String medecinNom;
    private String medecinPrenom;
    private String typeExamen;
    private String description;
    private String instructions;
    private LocalDateTime datePrescription;
    private LocalDateTime dateRealisation;
    private String resultat;
    private ExamenComplementaire.Statut statut;
    
    public static ExamenComplementaireDTO fromEntity(ExamenComplementaire examen) {
        ExamenComplementaireDTO dto = new ExamenComplementaireDTO();
        dto.setId(examen.getId());
        dto.setConsultationId(examen.getConsultation().getId());
        if (examen.getMedecin() != null) {
            dto.setMedecinId(examen.getMedecin().getId());
            dto.setMedecinNom(examen.getMedecin().getNom());
            dto.setMedecinPrenom(examen.getMedecin().getPrenom());
        }
        dto.setTypeExamen(examen.getTypeExamen());
        dto.setDescription(examen.getDescription());
        dto.setInstructions(examen.getInstructions());
        dto.setDatePrescription(examen.getDatePrescription());
        dto.setDateRealisation(examen.getDateRealisation());
        dto.setResultat(examen.getResultat());
        dto.setStatut(examen.getStatut());
        return dto;
    }
}