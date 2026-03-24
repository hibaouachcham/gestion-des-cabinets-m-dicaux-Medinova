package com.medinova.service;

import com.medinova.dto.CreateExamenRequest;
import com.medinova.dto.ExamenComplementaireDTO;
import com.medinova.entity.Consultation;
import com.medinova.entity.ExamenComplementaire;
import com.medinova.entity.Utilisateur;
import com.medinova.repository.ConsultationRepository;
import com.medinova.repository.ExamenComplementaireRepository;
import com.medinova.repository.UtilisateurRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ExamenComplementaireService {
    
    private final ExamenComplementaireRepository examenRepository;
    private final ConsultationRepository consultationRepository;
    private final UtilisateurRepository utilisateurRepository;
    
    public ExamenComplementaireService(ExamenComplementaireRepository examenRepository,
                                       ConsultationRepository consultationRepository,
                                       UtilisateurRepository utilisateurRepository) {
        this.examenRepository = examenRepository;
        this.consultationRepository = consultationRepository;
        this.utilisateurRepository = utilisateurRepository;
    }
    
    public ExamenComplementaireDTO createExamen(CreateExamenRequest request) {
        Consultation consultation = consultationRepository.findById(request.getConsultationId())
                .orElseThrow(() -> new RuntimeException("Consultation non trouvée"));
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur medecin = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        ExamenComplementaire examen = new ExamenComplementaire();
        examen.setConsultation(consultation);
        examen.setMedecin(medecin);
        examen.setTypeExamen(request.getTypeExamen());
        examen.setDescription(request.getDescription());
        examen.setInstructions(request.getInstructions());
        
        ExamenComplementaire saved = examenRepository.save(examen);
        return ExamenComplementaireDTO.fromEntity(saved);
    }
    
    @Transactional(readOnly = true)
    public List<ExamenComplementaireDTO> getExamensByConsultation(Long consultationId) {
        List<ExamenComplementaire> examens = examenRepository.findByConsultationIdOrderByDatePrescriptionDesc(consultationId);
        return examens.stream()
                .map(ExamenComplementaireDTO::fromEntity)
                .toList();
    }
    
    @Transactional(readOnly = true)
    public ExamenComplementaireDTO getExamenById(Long id) {
        ExamenComplementaire examen = examenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Examen complémentaire non trouvé"));
        return ExamenComplementaireDTO.fromEntity(examen);
    }
    
    public ExamenComplementaireDTO updateExamen(Long id, ExamenComplementaireDTO examenData) {
        ExamenComplementaire examen = examenRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Examen complémentaire non trouvé"));
        
        if (examenData.getTypeExamen() != null) {
            examen.setTypeExamen(examenData.getTypeExamen());
        }
        if (examenData.getDescription() != null) {
            examen.setDescription(examenData.getDescription());
        }
        if (examenData.getInstructions() != null) {
            examen.setInstructions(examenData.getInstructions());
        }
        if (examenData.getStatut() != null) {
            examen.setStatut(examenData.getStatut());
        }
        if (examenData.getDateRealisation() != null) {
            examen.setDateRealisation(examenData.getDateRealisation());
        }
        if (examenData.getResultat() != null) {
            examen.setResultat(examenData.getResultat());
        }
        
        ExamenComplementaire saved = examenRepository.save(examen);
        return ExamenComplementaireDTO.fromEntity(saved);
    }
}