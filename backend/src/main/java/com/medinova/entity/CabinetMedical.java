package com.medinova.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "cabinets_medicaux")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class CabinetMedical {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Size(max = 200)
    @Column(nullable = false)
    private String nom;
    
    @NotBlank
    @Size(max = 500)
    @Column(nullable = false)
    private String adresse;
    
    @Size(max = 20)
    private String telephone;
    
    @Size(max = 100)
    private String email;
    
    @Size(max = 50)
    private String ville;
    
    @Size(max = 10)
    @Column(name = "code_postal")
    private String codePostal;
    
    @JsonIgnore
    @OneToMany(mappedBy = "cabinet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Utilisateur> utilisateurs;
    
    @JsonIgnore
    @OneToMany(mappedBy = "cabinet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Patient> patients;
    
    @JsonIgnore
    @OneToOne(mappedBy = "cabinet", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private Abonnement abonnement;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}

