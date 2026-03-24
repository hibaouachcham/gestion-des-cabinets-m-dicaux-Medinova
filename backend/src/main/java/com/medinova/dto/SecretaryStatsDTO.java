package com.medinova.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SecretaryStatsDTO {
    private Long totalPatients;                    // Nombre total de patients du cabinet
    private Long patientsEnFileAttente;            // Nombre de patients envoyés au médecin (en file d'attente)
    private Long rendezVousAujourdhui;             // Rendez-vous du jour
    private Long rendezVousCetteSemaine;           // Rendez-vous de la semaine
    private Long rendezVousAVenir;                 // Rendez-vous planifiés (à venir)
    private Long facturesCeMois;                   // Factures du mois
    private Long consultationsCeMois;              // Consultations du mois
    private List<RendezVousDTO> prochainsRendezVous; // Liste des 5 prochains rendez-vous
}

