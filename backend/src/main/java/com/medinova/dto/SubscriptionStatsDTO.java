package com.medinova.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class SubscriptionStatsDTO {
    private long totalCabinets;
    private long totalAbonnements;
    private long abonnementsActifs;
    private long abonnementsExpires;
    private long abonnementsARenouveler; // Expirent dans les 15 prochains jours
    private List<AbonnementDTO> abonnements; // Liste détaillée des abonnements
}

