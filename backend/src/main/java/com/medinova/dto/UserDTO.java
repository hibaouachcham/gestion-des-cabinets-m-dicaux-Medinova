package com.medinova.dto;

import com.medinova.entity.Utilisateur;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UserDTO {
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
    
    public static UserDTO fromEntity(Utilisateur user) {
        UserDTO dto = new UserDTO();
        dto.setId(user.getId());
        dto.setUsername(user.getUsername());
        dto.setNom(user.getNom());
        dto.setPrenom(user.getPrenom());
        dto.setEmail(user.getEmail());
        dto.setTelephone(user.getTelephone());
        dto.setRole(user.getRole());
        if (user.getCabinet() != null) {
            dto.setCabinetId(user.getCabinet().getId());
            dto.setCabinetNom(user.getCabinet().getNom());
        }
        dto.setActive(user.isActive());
        return dto;
    }
}

