package com.medinova.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DoctorStatsDTO {
    private Long consultationsAujourdhui;
    private Long consultationsCetteSemaine;
    private Long consultationsCeMois;
    private Long patientsEnFileAttente;
    private Long totalPatients;
    private Long ordonnancesCeMois;
    private List<RendezVousDTO> prochainsRendezVous;
    private List<ConsultationDTO> consultationsRecentes;
}