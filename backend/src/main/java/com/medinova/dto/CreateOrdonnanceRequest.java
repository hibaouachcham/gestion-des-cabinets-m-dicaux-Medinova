package com.medinova.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class CreateOrdonnanceRequest {
    private Long consultationId;
    private String instructions;
    private List<LigneOrdonnanceRequest> lignes;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LigneOrdonnanceRequest {
        private Long medicamentId;
        private Integer quantite;
        private String posologie;
        private String duree;
    }
}