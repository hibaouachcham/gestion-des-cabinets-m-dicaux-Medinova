package com.medinova.controller;

import com.medinova.dto.CreateOrdonnanceRequest;
import com.medinova.dto.OrdonnanceDTO;
import com.medinova.service.OrdonnanceService;
import jakarta.validation.Valid;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ordonnances")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class OrdonnanceController {
    
    private final OrdonnanceService ordonnanceService;
    
    public OrdonnanceController(OrdonnanceService ordonnanceService) {
        this.ordonnanceService = ordonnanceService;
    }
    
    @PostMapping
    public ResponseEntity<OrdonnanceDTO> createOrdonnance(@Valid @RequestBody CreateOrdonnanceRequest request) {
        OrdonnanceDTO ordonnance = ordonnanceService.createOrdonnance(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ordonnance);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OrdonnanceDTO> getOrdonnanceById(@PathVariable Long id) {
        OrdonnanceDTO ordonnance = ordonnanceService.getOrdonnanceById(id);
        return ResponseEntity.ok(ordonnance);
    }
    
    @GetMapping("/consultation/{consultationId}")
    public ResponseEntity<List<OrdonnanceDTO>> getOrdonnancesByConsultation(@PathVariable Long consultationId) {
        List<OrdonnanceDTO> ordonnances = ordonnanceService.getOrdonnancesByConsultation(consultationId);
        return ResponseEntity.ok(ordonnances);
    }
    
    @GetMapping("/{id}/pdf")
    public ResponseEntity<Resource> generatePDF(@PathVariable Long id) {
        Resource resource = ordonnanceService.generatePDF(id);
        
        return ResponseEntity.ok()
                .contentType(MediaType.APPLICATION_PDF)
                .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=\"ordonnance_" + id + ".pdf\"")
                .body(resource);
    }
}