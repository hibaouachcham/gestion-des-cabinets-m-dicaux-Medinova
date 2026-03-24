package com.medinova.controller;

import com.medinova.dto.SecretaryStatsDTO;
import com.medinova.service.SecretaryService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/secr")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class SecretaryController {
    
    private final SecretaryService secretaryService;
    
    public SecretaryController(SecretaryService secretaryService) {
        this.secretaryService = secretaryService;
    }
    
    @GetMapping("/stats")
    public ResponseEntity<SecretaryStatsDTO> getStats() {
        SecretaryStatsDTO stats = secretaryService.getStats();
        return ResponseEntity.ok(stats);
    }
}

