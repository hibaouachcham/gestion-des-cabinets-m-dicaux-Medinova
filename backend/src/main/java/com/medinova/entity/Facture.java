package com.medinova.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "factures")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Facture {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false)
    private String numero;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "patient_id", nullable = false)
    private Patient patient;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "consultation_id")
    private Consultation consultation;
    
    @NotNull
    @DecimalMin("0.0")
    @Column(name = "montant_ht", nullable = false, precision = 10, scale = 2)
    private BigDecimal montantHT;
    
    @NotNull
    @DecimalMin("0.0")
    @Column(name = "taux_tva", nullable = false, precision = 5, scale = 2)
    private BigDecimal tauxTVA = BigDecimal.valueOf(0.20); // 20% par défaut
    
    @NotNull
    @DecimalMin("0.0")
    @Column(name = "montant_ttc", nullable = false, precision = 10, scale = 2)
    private BigDecimal montantTTC;
    
    @Enumerated(EnumType.STRING)
    @Column(name = "statut_paiement", nullable = false, columnDefinition = "VARCHAR(20)")
    private StatutPaiement statutPaiement = StatutPaiement.IMPAYE;
    
    @Column(name = "date_emission", nullable = false)
    private LocalDateTime dateEmission = LocalDateTime.now();
    
    @Column(name = "date_paiement")
    private LocalDateTime datePaiement;
    
    @Column(columnDefinition = "TEXT")
    private String notes;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt = LocalDateTime.now();
    
    @PreUpdate
    public void preUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
    
    @PrePersist
    public void generateNumero() {
        if (this.numero == null) {
            this.numero = "FAC-" + System.currentTimeMillis();
        }
        if (this.montantTTC == null && this.montantHT != null) {
            this.montantTTC = this.montantHT.multiply(BigDecimal.ONE.add(this.tauxTVA));
        }
    }
    
    public enum StatutPaiement {
        IMPAYE,
        PAYE,
        PARTIEL,
        REMBOURSE
    }
}

