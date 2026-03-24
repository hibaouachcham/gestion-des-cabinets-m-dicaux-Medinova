package com.medinova.dto;

import com.medinova.entity.Patient;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class PatientDTO {
    private Long id;
    private String cin;
    private String nom;
    private String prenom;
    private LocalDate dateNaissance;
    private String telephone;
    private String email;
    private String adresse;
    private String ville;
    private Patient.Sexe sexe;
    private Long cabinetId;
    private boolean enFileAttente; // Indique si le patient est déjà en file d'attente
    
    public static PatientDTO fromEntity(Patient patient) {
        PatientDTO dto = new PatientDTO();
        dto.setId(patient.getId());
        dto.setCin(patient.getCin());
        dto.setNom(patient.getNom());
        dto.setPrenom(patient.getPrenom());
        dto.setDateNaissance(patient.getDateNaissance());
        dto.setTelephone(patient.getTelephone());
        dto.setEmail(patient.getEmail());
        dto.setAdresse(patient.getAdresse());
        dto.setVille(patient.getVille());
        dto.setSexe(patient.getSexe());
        if (patient.getCabinet() != null) {
            dto.setCabinetId(patient.getCabinet().getId());
        }
        dto.setEnFileAttente(false); // Initialiser par défaut à false
        return dto;
    }
}

