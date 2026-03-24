package com.medinova.controller;

import com.medinova.config.TestSecurityConfig;
import com.medinova.dto.FactureDTO;
import com.medinova.entity.Facture;
import com.medinova.service.FactureService;
import org.junit.jupiter.api.Test;
import org.mockito.Mockito;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(FactureController.class)
@Import(TestSecurityConfig.class)
public class FactureControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FactureService factureService;

    @Test
    void testCreateFacture() throws Exception {
        FactureDTO dto = new FactureDTO();
        dto.setId(1L);

        Mockito.when(factureService.createFacture(
                Mockito.anyLong(),
                Mockito.any(),
                Mockito.any(),
                Mockito.any(),
                Mockito.any()
        )).thenReturn(dto);

        mockMvc.perform(post("/api/factures")
                        .param("patientId", "1")
                        .param("montantHT", "200")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testUpdateStatutPaiement() throws Exception {
        FactureDTO dto = new FactureDTO();
        dto.setStatutPaiement(Facture.StatutPaiement.PAYE);

        Mockito.when(factureService.updateStatutPaiement(
                Mockito.eq(1L),
                Mockito.eq(Facture.StatutPaiement.PAYE)
        )).thenReturn(dto);

        mockMvc.perform(patch("/api/factures/1/statut")
                        .param("statut", "PAYE")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }

    @Test
    void testDeleteFacture() throws Exception {
        Mockito.doNothing().when(factureService).deleteFacture(1L);

        mockMvc.perform(delete("/api/factures/1")
                        .contentType(MediaType.APPLICATION_JSON))
                .andExpect(status().isOk());
    }
}
