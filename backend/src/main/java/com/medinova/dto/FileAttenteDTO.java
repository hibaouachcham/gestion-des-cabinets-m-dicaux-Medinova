package com.medinova.dto;

import com.medinova.entity.FileAttente;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileAttenteDTO {
    private Long id;
    private PatientDTO patient;
    private Long medecinId;
    private String medecinNom;
    private String medecinPrenom;
    private Integer position;
    private LocalDateTime dateAjout;
    private LocalDateTime dateTraitement;
    private String statut; // "EN_ATTENTE", "EN_CONSULTATION", "TERMINE"
    private Long consultationId; // ID de la consultation si terminée
    
    public static FileAttenteDTO fromEntity(FileAttente fileAttente, String statut, Long consultationId) {
        FileAttenteDTO dto = new FileAttenteDTO();
        dto.setId(fileAttente.getId());
        dto.setPatient(PatientDTO.fromEntity(fileAttente.getPatient()));
        if (fileAttente.getMedecin() != null) {
            dto.setMedecinId(fileAttente.getMedecin().getId());
            dto.setMedecinNom(fileAttente.getMedecin().getNom());
            dto.setMedecinPrenom(fileAttente.getMedecin().getPrenom());
        }
        dto.setPosition(fileAttente.getPosition());
        dto.setDateAjout(fileAttente.getDateAjout());
        dto.setDateTraitement(fileAttente.getDateTraitement());
        dto.setStatut(statut);
        dto.setConsultationId(consultationId);
        return dto;
    }
}