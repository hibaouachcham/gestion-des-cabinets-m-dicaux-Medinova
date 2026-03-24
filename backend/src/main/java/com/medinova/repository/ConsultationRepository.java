package com.medinova.repository;

import com.medinova.entity.Consultation;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConsultationRepository extends JpaRepository<Consultation, Long> {
    @EntityGraph(attributePaths = {"medecin", "ordonnances"})
    List<Consultation> findByPatientIdOrderByDateConsultationDesc(Long patientId);
    
    @EntityGraph(attributePaths = {"patient", "ordonnances"})
    List<Consultation> findByMedecinIdOrderByDateConsultationDesc(Long medecinId);
}

