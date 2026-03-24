package com.medinova.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "documents_medicaux")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DocumentMedical {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dossier_id", nullable = false)
    private DossierMedical dossier;
    
    @NotBlank
    @Column(name = "nom_fichier", nullable = false)
    private String nomFichier;
    
    @NotBlank
    @Column(name = "chemin_fichier", nullable = false)
    private String cheminFichier;
    
    @Column
    private String type;
    
    @Column
    private Long taille;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private Utilisateur uploadedBy;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
}

