package com.medinova.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateDossierRequest {

    @NotNull(message = "L'ID du patient est requis")
    private Long patientId;

    // ANTÉCÉDENTS MÉDICAUX
    private String maladiesChroniques;
    private String chirurgiesAnterieures;
    private String hospitalisationsAnterieures;
    private String allergies;
    private String antecedentsFamiliaux;

    // INFORMATIONS BIOLOGIQUES
    private String groupeSanguin;
    private BigDecimal tailleCm;
    private BigDecimal poidsKg;
    private String constantesBiologiques;

    // NOTES MÉDICALES GÉNÉRALES
    private String observationsGlobales;
    private String suiviLongTerme;

    // TRAITEMENTS EN COURS
    private List<TraitementRequest> traitementsEnCours;

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TraitementRequest {
        private String nomMedicament;
        private String dosage;
        private String frequence;
        private String duree;
        private String notes;
        private LocalDate dateDebut;
        private LocalDate dateFin;
    }
}

