package com.medinova.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "dossiers_medicaux")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedical {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "patient_id", unique = true, nullable = false)
    private Patient patient;
    
    // Médecin responsable du dossier
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_responsable_id", nullable = true) // Nullable pour permettre la migration
    private Utilisateur medecinResponsable;
    
    // ANTÉCÉDENTS MÉDICAUX
    @Column(name = "maladies_chroniques", columnDefinition = "TEXT")
    private String maladiesChroniques;
    
    @Column(name = "chirurgies_anterieures", columnDefinition = "TEXT")
    private String chirurgiesAnterieures;
    
    @Column(name = "hospitalisations_anterieures", columnDefinition = "TEXT")
    private String hospitalisationsAnterieures;
    
    @Column(columnDefinition = "TEXT")
    private String allergies;
    
    @Column(name = "antecedents_familiaux", columnDefinition = "TEXT")
    private String antecedentsFamiliaux;
    
    // INFORMATIONS BIOLOGIQUES
    @Column(name = "groupe_sanguin", length = 10)
    private String groupeSanguin;
    
    @Column(name = "taille_cm", precision = 5, scale = 2)
    private BigDecimal tailleCm;
    
    @Column(name = "poids_kg", precision = 5, scale = 2)
    private BigDecimal poidsKg;
    
    @Column(name = "constantes_biologiques", columnDefinition = "TEXT")
    private String constantesBiologiques;
    
    // NOTES MÉDICALES GÉNÉRALES
    @Column(name = "observations_globales", columnDefinition = "TEXT")
    private String observationsGlobales;
    
    @Column(name = "suivi_long_terme", columnDefinition = "TEXT")
    private String suiviLongTerme;
    
    // Relations
    @OneToMany(mappedBy = "dossier", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<TraitementEnCours> traitementsEnCours;
    
    @OneToMany(mappedBy = "dossier", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<DocumentMedical> documents;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

