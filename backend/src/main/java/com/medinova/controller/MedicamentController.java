package com.medinova.controller;

import com.medinova.entity.Medicament;
import com.medinova.service.MedicamentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medicaments")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class MedicamentController {
    
    private final MedicamentService medicamentService;
    
    public MedicamentController(MedicamentService medicamentService) {
        this.medicamentService = medicamentService;
    }
    
    @GetMapping
    public ResponseEntity<List<Medicament>> searchMedicaments(@RequestParam(required = false) String q) {
        List<Medicament> medicaments = medicamentService.searchMedicaments(q);
        return ResponseEntity.ok(medicaments);
    }
    
    @GetMapping("/all")
    public ResponseEntity<List<Medicament>> getAllMedicaments() {
        List<Medicament> medicaments = medicamentService.getAllMedicaments();
        return ResponseEntity.ok(medicaments);
    }
}

