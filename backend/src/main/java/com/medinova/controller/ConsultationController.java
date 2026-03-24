package com.medinova.controller;

import com.medinova.dto.ConsultationDTO;
import com.medinova.dto.CreateConsultationRequest;
import com.medinova.dto.UpdateConsultationRequest;
import com.medinova.service.ConsultationService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/consultations")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class ConsultationController {
    
    private final ConsultationService consultationService;
    
    public ConsultationController(ConsultationService consultationService) {
        this.consultationService = consultationService;
    }
    
    @PostMapping
    public ResponseEntity<ConsultationDTO> createConsultation(@Valid @RequestBody CreateConsultationRequest request) {
        ConsultationDTO consultation = consultationService.createConsultation(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(consultation);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ConsultationDTO> getConsultationById(@PathVariable Long id) {
        ConsultationDTO consultation = consultationService.getConsultationById(id);
        return ResponseEntity.ok(consultation);
    }
    
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<ConsultationDTO>> getConsultationsByPatient(@PathVariable Long patientId) {
        List<ConsultationDTO> consultations = consultationService.getConsultationsByPatient(patientId);
        return ResponseEntity.ok(consultations);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<ConsultationDTO>> getAllConsultations() {
        List<ConsultationDTO> consultations = consultationService.getAllConsultationsByDoctor();
        return ResponseEntity.ok(consultations);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<ConsultationDTO> updateConsultation(
            @PathVariable Long id,
            @Valid @RequestBody UpdateConsultationRequest request) {
        ConsultationDTO consultation = consultationService.updateConsultation(id, request);
        return ResponseEntity.ok(consultation);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteConsultation(@PathVariable Long id) {
        consultationService.deleteConsultation(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Consultation supprimée avec succès");
        return ResponseEntity.ok(response);
    }
}