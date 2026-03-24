package com.medinova.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateCabinetRequest {
    @NotBlank(message = "Le nom du cabinet est requis")
    private String nom;
    
    @NotBlank(message = "L'adresse est requise")
    private String adresse;
    
    private String telephone;
    private String email;
    private String ville;
    private String codePostal;
    
    // Options d'abonnement
    @Valid
    private CreateAbonnementRequest abonnement;
}

