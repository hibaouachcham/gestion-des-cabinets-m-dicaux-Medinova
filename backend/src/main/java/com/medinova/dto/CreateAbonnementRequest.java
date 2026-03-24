package com.medinova.dto;

import com.medinova.entity.Abonnement;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateAbonnementRequest {
    @NotNull(message = "Le type d'abonnement est requis")
    private Abonnement.TypeAbonnement type;
    
    @NotNull(message = "La date de début est requise")
    private LocalDate dateDebut;
    
    @NotNull(message = "La date de fin est requise")
    private LocalDate dateFin;
    
    private boolean actif = true;
}

