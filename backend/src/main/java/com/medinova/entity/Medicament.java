package com.medinova.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.DecimalMin;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "medicaments")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Medicament {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @NotBlank
    @Column(nullable = false, unique = true)
    private String code;
    
    @NotBlank
    @Column(nullable = false)
    private String nom;
    
    @Column
    private String forme;
    
    @Column
    private String dosage;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @DecimalMin("0.0")
    @Column(precision = 10, scale = 2)
    private BigDecimal prix;
    
    @Column
    private boolean disponible = true;
    
    @JsonIgnore
    @OneToMany(mappedBy = "medicament", fetch = FetchType.LAZY)
    private java.util.List<LigneOrdonnance> lignesOrdonnances;
}

