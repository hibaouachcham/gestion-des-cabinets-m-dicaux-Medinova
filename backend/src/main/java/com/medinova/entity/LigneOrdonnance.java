package com.medinova.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "lignes_ordonnance")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class LigneOrdonnance {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "ordonnance_id", nullable = false)
    private Ordonnance ordonnance;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medicament_id", nullable = false)
    private Medicament medicament;
    
    @Positive
    @Column(nullable = false)
    private Integer quantite;
    
    @Column(columnDefinition = "TEXT")
    private String posologie;
    
    @Column(columnDefinition = "TEXT")
    private String duree;
}

