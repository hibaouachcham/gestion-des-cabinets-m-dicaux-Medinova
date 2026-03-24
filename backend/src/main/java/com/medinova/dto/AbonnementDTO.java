package com.medinova.dto;

import com.medinova.entity.Abonnement;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AbonnementDTO {
    private Long id;
    private Long cabinetId;
    private String cabinetNom;
    private Abonnement.TypeAbonnement type;
    private LocalDate dateDebut;
    private LocalDate dateFin;
    private boolean actif;
    private String statut; // ACTIF, EXPIRÉ, À RENOUVELER, DÉSACTIVÉ
    private String medecinNom; // Nom du médecin associé au cabinet
    private String medecinPrenom;
    
    public static AbonnementDTO fromEntity(Abonnement abonnement) {
        AbonnementDTO dto = new AbonnementDTO();
        dto.setId(abonnement.getId());
        if (abonnement.getCabinet() != null) {
            dto.setCabinetId(abonnement.getCabinet().getId());
            dto.setCabinetNom(abonnement.getCabinet().getNom());
        }
        dto.setType(abonnement.getType());
        dto.setDateDebut(abonnement.getDateDebut());
        dto.setDateFin(abonnement.getDateFin());
        // Le champ actif dans le DTO représente le statut réel (vérifie aussi les dates)
        dto.setActif(abonnement.isActif());
        dto.setStatut(abonnement.getStatut());
        return dto;
    }
}

