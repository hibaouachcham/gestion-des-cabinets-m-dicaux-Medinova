package com.medinova.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateConsultationRequest {
    private Long patientId;
    private Long rendezVousId;
    private String motif;
    private String examenClinique;
    private String diagnostic;
    private String prescription;
    private String observations;
}