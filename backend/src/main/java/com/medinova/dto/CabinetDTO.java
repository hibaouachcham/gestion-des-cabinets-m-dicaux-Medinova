package com.medinova.dto;

import com.medinova.entity.CabinetMedical;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CabinetDTO {
    private Long id;
    private String nom;
    private String adresse;
    private String telephone;
    private String email;
    private String ville;
    private String codePostal;
    
    public static CabinetDTO fromEntity(CabinetMedical cabinet) {
        CabinetDTO dto = new CabinetDTO();
        dto.setId(cabinet.getId());
        dto.setNom(cabinet.getNom());
        dto.setAdresse(cabinet.getAdresse());
        dto.setTelephone(cabinet.getTelephone());
        dto.setEmail(cabinet.getEmail());
        dto.setVille(cabinet.getVille());
        dto.setCodePostal(cabinet.getCodePostal());
        return dto;
    }
}

