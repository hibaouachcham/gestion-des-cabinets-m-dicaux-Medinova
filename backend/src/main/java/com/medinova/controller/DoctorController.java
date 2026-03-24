
package com.medinova.controller;

import com.medinova.dto.DoctorStatsDTO;
import com.medinova.service.DoctorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class DoctorController {
    
    private final DoctorService doctorService;
    
    public DoctorController(DoctorService doctorService) {
        this.doctorService = doctorService;
    }
    
    @GetMapping("/stats")
    public ResponseEntity<DoctorStatsDTO> getStats() {
        DoctorStatsDTO stats = doctorService.getStats();
        return ResponseEntity.ok(stats);
    }
}