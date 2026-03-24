package com.medinova.controller;

import com.medinova.dto.FactureDTO;
import com.medinova.entity.Facture;
import com.medinova.service.FactureService;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/factures")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class FactureController {
    
    private final FactureService factureService;
    
    public FactureController(FactureService factureService) {
        this.factureService = factureService;
    }
    
    @GetMapping
    public ResponseEntity<Page<FactureDTO>> getFactures(
            @RequestParam(required = false) Long patientId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dateEmission") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<FactureDTO> factures = factureService.getFactures(patientId, from, to, pageable);
        return ResponseEntity.ok(factures);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<FactureDTO> getFactureById(@PathVariable Long id) {
        FactureDTO facture = factureService.getFactureDTOById(id);
        return ResponseEntity.ok(facture);
    }
    
    @PostMapping
    public ResponseEntity<FactureDTO> createFacture(
            @RequestParam Long patientId,
            @RequestParam(required = false) Long consultationId,
            @RequestParam BigDecimal montantHT,
            @RequestParam(required = false) BigDecimal tauxTVA,
            @RequestParam(required = false) String notes) {
        
        FactureDTO facture = factureService.createFacture(patientId, consultationId, montantHT, tauxTVA, notes);
        return ResponseEntity.ok(facture);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<java.util.Map<String, String>> deleteFacture(@PathVariable Long id) {
        factureService.deleteFacture(id);
        java.util.Map<String, String> response = new java.util.HashMap<>();
        response.put("message", "Facture supprimée avec succès");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> generatePDF(@PathVariable Long id) {
        Resource resource = factureService.generatePDF(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"facture_" + id + ".pdf\"")
                .body(resource);
    }
    
    @PatchMapping("/{id}/statut")
    public ResponseEntity<FactureDTO> updateStatutPaiement(
            @PathVariable Long id,
            @RequestParam Facture.StatutPaiement statut) {
        
        FactureDTO facture = factureService.updateStatutPaiement(id, statut);
        return ResponseEntity.ok(facture);
    }
}

