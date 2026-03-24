package com.medinova.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class UpdateDossierRequest {
    // Antécédents médicaux
    private String maladiesChroniques;
    private String chirurgiesAnterieures;
    private String hospitalisationsAnterieures;
    private String allergies;
    private String antecedentsFamiliaux;
    
    // Informations biologiques
    private String groupeSanguin;
    private BigDecimal tailleCm;
    private BigDecimal poidsKg;
    private String constantesBiologiques;
    
    // Notes médicales
    private String observationsGlobales;
    private String suiviLongTerme;
    
    // Traitements en cours
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
        private java.time.LocalDate dateDebut;
        private java.time.LocalDate dateFin;
        private Boolean actif;
    }
}