package com.medinova.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateConsultationRequest {
    private String motif;
    private String examenClinique;
    private String diagnostic;
    private String prescription;
    private String observations;
}