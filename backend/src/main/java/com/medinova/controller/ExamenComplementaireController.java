
package com.medinova.controller;

import com.medinova.dto.CreateExamenRequest;
import com.medinova.dto.ExamenComplementaireDTO;
import com.medinova.service.ExamenComplementaireService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/examens")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class ExamenComplementaireController {
    
    private final ExamenComplementaireService examenService;
    
    public ExamenComplementaireController(ExamenComplementaireService examenService) {
        this.examenService = examenService;
    }
    
    @PostMapping
    public ResponseEntity<ExamenComplementaireDTO> createExamen(@Valid @RequestBody CreateExamenRequest request) {
        ExamenComplementaireDTO examen = examenService.createExamen(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(examen);
    }
    
    @GetMapping("/consultation/{consultationId}")
    public ResponseEntity<List<ExamenComplementaireDTO>> getExamensByConsultation(@PathVariable Long consultationId) {
        List<ExamenComplementaireDTO> examens = examenService.getExamensByConsultation(consultationId);
        return ResponseEntity.ok(examens);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ExamenComplementaireDTO> getExamenById(@PathVariable Long id) {
        ExamenComplementaireDTO examen = examenService.getExamenById(id);
        return ResponseEntity.ok(examen);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ExamenComplementaireDTO> updateExamen(@PathVariable Long id,
                                                              @RequestBody ExamenComplementaireDTO examenData) {
        ExamenComplementaireDTO examen = examenService.updateExamen(id, examenData);
        return ResponseEntity.ok(examen);
    }
}