package com.medinova.controller;

import com.medinova.dto.CreateDossierRequest;
import com.medinova.dto.DossierMedicalDTO;
import com.medinova.service.DossierMedicalService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/dossiers")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class DossierMedicalController {

    private final DossierMedicalService dossierMedicalService;

    public DossierMedicalController(DossierMedicalService dossierMedicalService) {
        this.dossierMedicalService = dossierMedicalService;
    }

    /**
     * POST /api/dossiers → Créer un dossier médical
     */
    @PostMapping
    public ResponseEntity<DossierMedicalDTO> createDossier(@Valid @RequestBody CreateDossierRequest request) {
        DossierMedicalDTO created = dossierMedicalService.createDossier(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }

    /**
     * GET /api/dossiers/patient/{patientId} → Récupérer le dossier médical d'un patient
     */
    @GetMapping("/patient/{patientId}")
    public ResponseEntity<DossierMedicalDTO> getDossierByPatientId(@PathVariable Long patientId) {
        DossierMedicalDTO dto = dossierMedicalService.getDossierByPatientId(patientId);
        return ResponseEntity.ok(dto);
    }

    /**
     * GET /api/dossiers/exists/{patientId} → Vérifier si un dossier existe
     */
    @GetMapping("/exists/{patientId}")
    public ResponseEntity<Map<String, Boolean>> checkDossierExists(@PathVariable Long patientId) {
        boolean exists = dossierMedicalService.dossierExists(patientId);
        Map<String, Boolean> response = new HashMap<>();
        response.put("exists", exists);
        return ResponseEntity.ok(response);
    }

    /**
     * PUT /api/dossiers/{id} → Modifier le dossier médical
     */
    @PutMapping("/{id}")
    public ResponseEntity<DossierMedicalDTO> updateDossier(@PathVariable Long id,
                                                           @Valid @RequestBody DossierMedicalDTO dto) {
        DossierMedicalDTO updated = dossierMedicalService.updateDossier(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    /**
     * PUT /api/dossiers/patient/{patientId} → Modifier le dossier médical d'un patient
     */
    @PutMapping("/patient/{patientId}")
    public ResponseEntity<DossierMedicalDTO> updateDossierByPatientId(@PathVariable Long patientId,
                                                                      @Valid @RequestBody com.medinova.dto.UpdateDossierRequest request) {
        DossierMedicalDTO updated = dossierMedicalService.updateDossierByPatientId(patientId, request);
        return ResponseEntity.ok(updated);
    }

    /**
     * POST /api/dossiers/{id}/documents → Ajouter un document médical
     */
    @PostMapping("/{id}/documents")
    public ResponseEntity<DossierMedicalDTO> addDocument(
            @PathVariable Long id,
            @RequestParam("file") MultipartFile file,
            @RequestParam(required = false) String description) {
        DossierMedicalDTO updated = dossierMedicalService.addDocument(id, file, description);
        return ResponseEntity.ok(updated);
    }
}