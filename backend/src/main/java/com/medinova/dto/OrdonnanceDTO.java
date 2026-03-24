package com.medinova.dto;

import com.medinova.entity.Ordonnance;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class OrdonnanceDTO {
    private Long id;
    private Long consultationId;
    private Long medecinId;
    private String medecinNom;
    private String medecinPrenom;
    private String instructions;
    private LocalDateTime dateEmission;
    private List<LigneOrdonnanceDTO> lignes;
    
    public static OrdonnanceDTO fromEntity(Ordonnance ordonnance) {
        OrdonnanceDTO dto = new OrdonnanceDTO();
        dto.setId(ordonnance.getId());
        dto.setConsultationId(ordonnance.getConsultation().getId());
        if (ordonnance.getMedecin() != null) {
            dto.setMedecinId(ordonnance.getMedecin().getId());
            dto.setMedecinNom(ordonnance.getMedecin().getNom());
            dto.setMedecinPrenom(ordonnance.getMedecin().getPrenom());
        }
        dto.setInstructions(ordonnance.getInstructions());
        dto.setDateEmission(ordonnance.getDateEmission());
        if (ordonnance.getLignes() != null) {
            dto.setLignes(ordonnance.getLignes().stream()
                    .map(LigneOrdonnanceDTO::fromEntity)
                    .toList());
        }
        return dto;
    }
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LigneOrdonnanceDTO {
        private Long id;
        private Long medicamentId;
        private String medicamentNom;
        private String medicamentCode;
        private String medicamentForme;
        private String medicamentDosage;
        private Integer quantite;
        private String posologie;
        private String duree;
        
        public static LigneOrdonnanceDTO fromEntity(com.medinova.entity.LigneOrdonnance ligne) {
            LigneOrdonnanceDTO dto = new LigneOrdonnanceDTO();
            dto.setId(ligne.getId());
            if (ligne.getMedicament() != null) {
                dto.setMedicamentId(ligne.getMedicament().getId());
                dto.setMedicamentNom(ligne.getMedicament().getNom());
                dto.setMedicamentCode(ligne.getMedicament().getCode());
                dto.setMedicamentForme(ligne.getMedicament().getForme());
                dto.setMedicamentDosage(ligne.getMedicament().getDosage());
            }
            dto.setQuantite(ligne.getQuantite());
            dto.setPosologie(ligne.getPosologie());
            dto.setDuree(ligne.getDuree());
            return dto;
        }
    }
}