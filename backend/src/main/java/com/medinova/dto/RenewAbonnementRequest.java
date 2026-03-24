package com.medinova.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class RenewAbonnementRequest {
    @NotNull(message = "La nouvelle date de fin est requise")
    private LocalDate nouvelleDateFin;
    
    private boolean activer = true;
}

