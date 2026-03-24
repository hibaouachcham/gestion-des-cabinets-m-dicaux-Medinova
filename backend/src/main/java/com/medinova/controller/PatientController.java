package com.medinova.controller;

import com.medinova.dto.PatientDTO;
import com.medinova.service.PatientService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/patients")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class PatientController {
    
    private final PatientService patientService;
    
    public PatientController(PatientService patientService) {
        this.patientService = patientService;
    }
    
    @GetMapping
    public ResponseEntity<Page<PatientDTO>> getPatients(
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "id") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<PatientDTO> patients = patientService.searchPatients(search, pageable);
        return ResponseEntity.ok(patients);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PatientDTO> getPatientById(@PathVariable Long id) {
        PatientDTO patient = patientService.getPatientById(id);
        return ResponseEntity.ok(patient);
    }
    
    @PostMapping
    public ResponseEntity<PatientDTO> createPatient(@Valid @RequestBody PatientDTO dto) {
        PatientDTO created = patientService.createPatient(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<PatientDTO> updatePatient(@PathVariable Long id,
                                                   @Valid @RequestBody PatientDTO dto) {
        PatientDTO updated = patientService.updatePatient(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deletePatient(@PathVariable Long id) {
        patientService.deletePatient(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Patient supprimé avec succès");
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/{id}/enqueue")
    public ResponseEntity<Map<String, String>> enqueuePatient(@PathVariable Long id) {
        patientService.enqueuePatient(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Patient ajouté à la file d'attente");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/medecins")
    public ResponseEntity<java.util.List<Map<String, Object>>> getMedecins() {
        java.util.List<com.medinova.entity.Utilisateur> medecins = patientService.getMedecinsDuCabinet();
        java.util.List<Map<String, Object>> result = medecins.stream()
                .map(m -> {
                    Map<String, Object> map = new HashMap<>();
                    map.put("id", m.getId());
                    map.put("nom", m.getNom());
                    map.put("prenom", m.getPrenom());
                    map.put("username", m.getUsername());
                    return map;
                })
                .collect(java.util.stream.Collectors.toList());
        return ResponseEntity.ok(result);
    }
    
    @GetMapping("/queue/current")
    public ResponseEntity<PatientDTO> getCurrentPatientInQueue() {
        PatientDTO patient = patientService.getCurrentPatientInQueue();
        if (patient == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(patient);
    }
    
    /**
     * Marque un patient comme étant en cours de consultation
     * Appelé quand le médecin clique sur "Commencer la consultation"
     */
    @PostMapping("/{id}/start-consultation")
    public ResponseEntity<Map<String, String>> startConsultation(@PathVariable Long id) {
        patientService.startConsultation(id);
        Map<String, String> response = new HashMap<>();
        response.put("message", "Consultation démarrée");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/search")
    public ResponseEntity<java.util.List<PatientDTO>> searchPatientByCinOrName(
            @RequestParam(required = false) String cin,
            @RequestParam(required = false) String nom) {
        java.util.List<PatientDTO> patients = patientService.searchPatientByCinOrName(cin, nom);
        return ResponseEntity.ok(patients);
    }
    
    /**
     * Récupère tous les patients en file d'attente avec leurs statuts
     */
    @GetMapping("/queue/all")
    public ResponseEntity<java.util.List<com.medinova.dto.FileAttenteDTO>> getAllPatientsInQueue() {
        java.util.List<com.medinova.dto.FileAttenteDTO> files = patientService.getAllPatientsInQueue();
        return ResponseEntity.ok(files);
    }
}