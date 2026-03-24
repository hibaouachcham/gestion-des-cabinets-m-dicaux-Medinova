package com.medinova.dto;

import com.medinova.entity.Consultation;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ConsultationDTO {
    private Long id;
    private Long patientId;
    private String patientNom;
    private String patientPrenom;
    private String patientCin;
    private LocalDateTime dateConsultation;
    private String motif;
    private String examenClinique;
    private String diagnostic;
    private String prescription;
    private String observations;
    private Integer nombreOrdonnances;
    
    public static ConsultationDTO fromEntity(Consultation consultation) {
        ConsultationDTO dto = new ConsultationDTO();
        dto.setId(consultation.getId());
        dto.setPatientId(consultation.getPatient().getId());
        dto.setPatientNom(consultation.getPatient().getNom());
        dto.setPatientPrenom(consultation.getPatient().getPrenom());
        dto.setPatientCin(consultation.getPatient().getCin());
        dto.setDateConsultation(consultation.getDateConsultation());
        dto.setMotif(consultation.getMotif());
        dto.setExamenClinique(consultation.getExamenClinique());
        dto.setDiagnostic(consultation.getDiagnostic());
        dto.setPrescription(consultation.getPrescription());
        dto.setObservations(consultation.getObservations());
        dto.setNombreOrdonnances(consultation.getOrdonnances() != null ? consultation.getOrdonnances().size() : 0);
        return dto;
    }
}