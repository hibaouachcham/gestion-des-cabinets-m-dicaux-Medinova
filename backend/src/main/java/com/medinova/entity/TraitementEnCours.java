package com.medinova.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "traitements_en_cours")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class TraitementEnCours {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_id", nullable = false)
    private DossierMedical dossier;
    
    @NotBlank
    @Column(name = "nom_medicament", nullable = false, length = 200)
    private String nomMedicament;
    
    @Column(name = "dosage", length = 100)
    private String dosage;
    
    @Column(name = "frequence", length = 100)
    private String frequence;
    
    @Column(name = "duree", length = 100)
    private String duree;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "date_debut")
    private java.time.LocalDate dateDebut;
    
    @Column(name = "date_fin")
    private java.time.LocalDate dateFin;
    
    @Column(name = "actif", nullable = false)
    private Boolean actif = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}