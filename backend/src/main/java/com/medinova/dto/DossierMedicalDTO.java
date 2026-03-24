package com.medinova.dto;

import com.medinova.entity.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class DossierMedicalDTO {

    // ========== INFORMATIONS ADMINISTRATIVES DU PATIENT ==========
    private Long patientId;
    private String patientCin;
    private String patientNom;
    private String patientPrenom;
    private LocalDate patientDateNaissance;
    private Patient.Sexe patientSexe;
    private String patientTelephone;
    private String patientEmail;
    private String patientAdresse;
    private String patientVille;

    // ========== INFORMATIONS DU DOSSIER ==========
    private Long dossierId;
    private Long medecinResponsableId;
    private String medecinResponsableNom;
    private String medecinResponsablePrenom;
    private LocalDateTime dateCreationDossier;

    // ========== ANTÉCÉDENTS MÉDICAUX ==========
    private String maladiesChroniques;
    private String chirurgiesAnterieures;
    private String hospitalisationsAnterieures;
    private String allergies;
    private String antecedentsFamiliaux;

    // ========== INFORMATIONS BIOLOGIQUES ==========
    private String groupeSanguin;
    private BigDecimal tailleCm;
    private BigDecimal poidsKg;
    private String constantesBiologiques;

    // ========== NOTES MÉDICALES GÉNÉRALES ==========
    private String observationsGlobales;
    private String suiviLongTerme;

    // ========== TRAITEMENTS EN COURS ==========
    private List<TraitementDTO> traitementsEnCours;

    // ========== HISTORIQUE DES CONSULTATIONS ==========
    private List<ConsultationDetailDTO> consultations;

    // ========== DOCUMENTS MÉDICAUX ==========
    private List<DocumentMedicalDTO> documents;

    // ========== DTOs INTERNES ==========
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TraitementDTO {
        private Long id;
        private String nomMedicament;
        private String dosage;
        private String frequence;
        private String duree;
        private String notes;
        private LocalDate dateDebut;
        private LocalDate dateFin;
        private Boolean actif;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class ConsultationDetailDTO {
        private Long id;
        private LocalDateTime dateConsultation;
        private String motif;
        private String examenClinique;
        private String diagnostic;
        private String prescription;
        private String observations;
        private Long medecinId;
        private String medecinNom;
        private String medecinPrenom;
        private List<OrdonnanceResumeDTO> ordonnances;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OrdonnanceResumeDTO {
        private Long id;
        private LocalDateTime dateEmission;
        private String type; // MEDICAMENTS ou EXAMENS
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class DocumentMedicalDTO {
        private Long id;
        private String nomFichier;
        private String type;
        private Long taille;
        private String description;
        private LocalDateTime dateUpload;
        private String uploadedByNom;
    }

    // ========== MÉTHODES DE CONVERSION ==========
    public static DossierMedicalDTO fromEntities(Patient patient,
                                                 DossierMedical dossier,
                                                 List<Consultation> consultations,
                                                 List<TraitementEnCours> traitements,
                                                 List<DocumentMedical> documents,
                                                 Utilisateur medecinResponsable) {
        DossierMedicalDTO dto = new DossierMedicalDTO();

        // Informations patient
        dto.setPatientId(patient.getId());
        dto.setPatientCin(patient.getCin());
        dto.setPatientNom(patient.getNom());
        dto.setPatientPrenom(patient.getPrenom());
        dto.setPatientDateNaissance(patient.getDateNaissance());
        dto.setPatientSexe(patient.getSexe());
        dto.setPatientTelephone(patient.getTelephone());
        dto.setPatientEmail(patient.getEmail());
        dto.setPatientAdresse(patient.getAdresse());
        dto.setPatientVille(patient.getVille());

        if (dossier != null) {
            dto.setDossierId(dossier.getId());
            dto.setDateCreationDossier(dossier.getCreatedAt());

            if (medecinResponsable != null) {
                dto.setMedecinResponsableId(medecinResponsable.getId());
                dto.setMedecinResponsableNom(medecinResponsable.getNom());
                dto.setMedecinResponsablePrenom(medecinResponsable.getPrenom());
            }

            // Antécédents
            dto.setMaladiesChroniques(dossier.getMaladiesChroniques());
            dto.setChirurgiesAnterieures(dossier.getChirurgiesAnterieures());
            dto.setHospitalisationsAnterieures(dossier.getHospitalisationsAnterieures());
            dto.setAllergies(dossier.getAllergies());
            dto.setAntecedentsFamiliaux(dossier.getAntecedentsFamiliaux());

            // Informations biologiques
            dto.setGroupeSanguin(dossier.getGroupeSanguin());
            dto.setTailleCm(dossier.getTailleCm());
            dto.setPoidsKg(dossier.getPoidsKg());
            dto.setConstantesBiologiques(dossier.getConstantesBiologiques());

            // Notes médicales
            dto.setObservationsGlobales(dossier.getObservationsGlobales());
            dto.setSuiviLongTerme(dossier.getSuiviLongTerme());
        }

        // Traitements en cours
        if (traitements != null) {
            dto.setTraitementsEnCours(
                    traitements.stream()
                            .map(t -> new TraitementDTO(
                                    t.getId(),
                                    t.getNomMedicament(),
                                    t.getDosage(),
                                    t.getFrequence(),
                                    t.getDuree(),
                                    t.getNotes(),
                                    t.getDateDebut(),
                                    t.getDateFin(),
                                    t.getActif()
                            ))
                            .collect(Collectors.toList())
            );
        }

        // Consultations
        if (consultations != null) {
            dto.setConsultations(
                    consultations.stream()
                            .map(c -> {
                                ConsultationDetailDTO cdto = new ConsultationDetailDTO();
                                cdto.setId(c.getId());
                                cdto.setDateConsultation(c.getDateConsultation());
                                cdto.setMotif(c.getMotif());
                                cdto.setExamenClinique(c.getExamenClinique());
                                cdto.setDiagnostic(c.getDiagnostic());
                                cdto.setPrescription(c.getPrescription());
                                cdto.setObservations(c.getObservations());
                                if (c.getMedecin() != null) {
                                    cdto.setMedecinId(c.getMedecin().getId());
                                    cdto.setMedecinNom(c.getMedecin().getNom());
                                    cdto.setMedecinPrenom(c.getMedecin().getPrenom());
                                }
                                // Ordonnances
                                if (c.getOrdonnances() != null) {
                                    cdto.setOrdonnances(
                                            c.getOrdonnances().stream()
                                                    .map(o -> new OrdonnanceResumeDTO(
                                                            o.getId(),
                                                            o.getDateEmission(),
                                                            o.getInstructions() != null && o.getInstructions().toLowerCase().contains("examen") ? "EXAMENS" : "MEDICAMENTS"
                                                    ))
                                                    .collect(Collectors.toList())
                                    );
                                }
                                return cdto;
                            })
                            .collect(Collectors.toList())
            );
        }

        // Documents médicaux
        if (documents != null) {
            dto.setDocuments(
                    documents.stream()
                            .map(doc -> new DocumentMedicalDTO(
                                    doc.getId(),
                                    doc.getNomFichier(),
                                    doc.getType(),
                                    doc.getTaille(),
                                    doc.getDescription(),
                                    doc.getCreatedAt(),
                                    doc.getUploadedBy() != null ? doc.getUploadedBy().getNom() + " " + doc.getUploadedBy().getPrenom() : null
                            ))
                            .collect(Collectors.toList())
            );
        }

        return dto;
    }
}