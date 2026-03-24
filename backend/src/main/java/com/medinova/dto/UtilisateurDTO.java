package com.medinova.dto;

import com.medinova.entity.Utilisateur;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UtilisateurDTO {
    private Long id;
    private String username;
    private String nom;
    private String prenom;
    private String email;
    private String telephone;
    private Utilisateur.Role role;
    private Long cabinetId;
    private String cabinetNom;
    private boolean active;
    
    public static UtilisateurDTO fromEntity(Utilisateur utilisateur) {
        UtilisateurDTO dto = new UtilisateurDTO();
        dto.setId(utilisateur.getId());
        dto.setUsername(utilisateur.getUsername());
        dto.setNom(utilisateur.getNom());
        dto.setPrenom(utilisateur.getPrenom());
        dto.setEmail(utilisateur.getEmail());
        dto.setTelephone(utilisateur.getTelephone());
        dto.setRole(utilisateur.getRole());
        dto.setActive(utilisateur.isActive());
        if (utilisateur.getCabinet() != null) {
            dto.setCabinetId(utilisateur.getCabinet().getId());
            dto.setCabinetNom(utilisateur.getCabinet().getNom());
        }
        return dto;
    }
}

