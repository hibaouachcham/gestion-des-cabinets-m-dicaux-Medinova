package com.medinova.controller;

import com.medinova.dto.RendezVousDTO;
import com.medinova.service.RendezVousService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/rendezvous")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class RendezVousController {
    
    private final RendezVousService rendezVousService;
    
    public RendezVousController(RendezVousService rendezVousService) {
        this.rendezVousService = rendezVousService;
    }
    
    @GetMapping
    public ResponseEntity<Page<RendezVousDTO>> getRendezVous(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "dateHeure") String sortBy,
            @RequestParam(defaultValue = "ASC") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<RendezVousDTO> rdv = rendezVousService.getRendezVous(from, to, pageable);
        return ResponseEntity.ok(rdv);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<RendezVousDTO> getRendezVousById(@PathVariable Long id) {
        RendezVousDTO rdv = rendezVousService.getRendezVousById(id);
        return ResponseEntity.ok(rdv);
    }
    
    @PostMapping
    public ResponseEntity<RendezVousDTO> createRendezVous(@Valid @RequestBody RendezVousDTO dto) {
        RendezVousDTO created = rendezVousService.createRendezVous(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(created);
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<RendezVousDTO> updateRendezVous(@PathVariable Long id,
                                                          @RequestBody RendezVousDTO dto) {
        RendezVousDTO updated = rendezVousService.updateRendezVous(id, dto);
        return ResponseEntity.ok(updated);
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRendezVous(@PathVariable Long id) {
        rendezVousService.deleteRendezVous(id);
        return ResponseEntity.noContent().build();
    }
}

