package com.medinova.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Entity
@Table(name = "file_attente")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FileAttente {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @OneToOne
    @JoinColumn(name = "patient_id", unique = true, nullable = false)
    private Patient patient;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "medecin_id")
    private Utilisateur medecin;
    
    @Column(name = "position", nullable = false)
    private Integer position;
    
    @Column(name = "date_ajout", nullable = false)
    private LocalDateTime dateAjout = LocalDateTime.now();
    
    @Column(name = "date_traitement")
    private LocalDateTime dateTraitement;
}

