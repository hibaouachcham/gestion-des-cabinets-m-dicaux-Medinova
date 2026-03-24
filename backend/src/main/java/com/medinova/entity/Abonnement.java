package com.medinova.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "abonnements")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Abonnement {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "cabinet_id", unique = true, nullable = false)
    private CabinetMedical cabinet;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false, columnDefinition = "VARCHAR(20)")
    private TypeAbonnement type;
    
    @NotNull
    @Column(name = "date_debut", nullable = false)
    private LocalDate dateDebut;
    
    @NotNull
    @Column(name = "date_fin", nullable = false)
    private LocalDate dateFin;
    
    @Column(nullable = false)
    private boolean actif = true;
    
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt = LocalDateTime.now();
    
    /**
     * Vérifie si l'abonnement est actuellement actif (actif = true et dateFin >= aujourd'hui)
     */
    public boolean isActif() {
        LocalDate aujourdhui = LocalDate.now();
        return actif && dateFin != null && !dateFin.isBefore(aujourdhui);
    }
    
    /**
     * Vérifie si l'abonnement est expiré (dateFin < aujourd'hui)
     */
    public boolean isExpire() {
        LocalDate aujourdhui = LocalDate.now();
        return dateFin != null && dateFin.isBefore(aujourdhui);
    }
    
    /**
     * Vérifie si l'abonnement expire bientôt (dans les 15 prochains jours)
     */
    public boolean expireBientot() {
        LocalDate aujourdhui = LocalDate.now();
        LocalDate dateAlerte = aujourdhui.plusDays(15);
        return isActif() && dateFin != null && !dateFin.isAfter(dateAlerte) && !dateFin.isBefore(aujourdhui);
    }
    
    /**
     * Retourne le statut de l'abonnement sous forme de chaîne
     */
    public String getStatut() {
        if (!actif) {
            return "DÉSACTIVÉ";
        }
        if (isExpire()) {
            return "EXPIRÉ";
        }
        if (expireBientot()) {
            return "À RENOUVELER";
        }
        return "ACTIF";
    }
    
    public enum TypeAbonnement {
        BASIC,
        PREMIUM,
        ENTERPRISE
    }
}

