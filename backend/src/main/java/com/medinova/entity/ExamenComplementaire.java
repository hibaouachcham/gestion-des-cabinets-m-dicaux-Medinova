package com.medinova.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "examens_complementaires")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class ExamenComplementaire {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id", nullable = false)
    private Consultation consultation;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id", nullable = false)
    private Utilisateur medecin;
    
    @NotBlank
    @Column(nullable = false, columnDefinition = "TEXT")
    private String typeExamen;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(columnDefinition = "TEXT")
    private String instructions;
    
    @Column(name = "date_prescription", nullable = false)
    private LocalDateTime datePrescription = LocalDateTime.now();
    
    @Column(name = "date_realisation")
    private LocalDateTime dateRealisation;
    
    @Column(name = "resultat", columnDefinition = "TEXT")
    private String resultat;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "statut", nullable = false, columnDefinition = "VARCHAR(20)")
    private Statut statut = Statut.PRESCRIT;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    public enum Statut {
        PRESCRIT,
        EN_COURS,
        TERMINE,
        ANNULE
    }
}