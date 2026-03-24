package com.medinova.dto;

import com.medinova.entity.RendezVous;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RendezVousDTO {
    private Long id;
    private Long patientId;
    private String patientNom;
    private String patientPrenom;
    private String patientCin;
    private Long medecinId;
    private String medecinNom;
    private LocalDateTime dateHeure;
    private String motif;
    private RendezVous.Statut statut;
    private String notes;
    
    public static RendezVousDTO fromEntity(RendezVous rdv) {
        RendezVousDTO dto = new RendezVousDTO();
        dto.setId(rdv.getId());
        if (rdv.getPatient() != null) {
            dto.setPatientId(rdv.getPatient().getId());
            dto.setPatientNom(rdv.getPatient().getNom());
            dto.setPatientPrenom(rdv.getPatient().getPrenom());
            dto.setPatientCin(rdv.getPatient().getCin());
        }
        if (rdv.getMedecin() != null) {
            dto.setMedecinId(rdv.getMedecin().getId());
            dto.setMedecinNom(rdv.getMedecin().getNom() + " " + rdv.getMedecin().getPrenom());
        }
        dto.setDateHeure(rdv.getDateHeure());
        dto.setMotif(rdv.getMotif());
        dto.setStatut(rdv.getStatut());
        dto.setNotes(rdv.getNotes());
        return dto;
    }
}

