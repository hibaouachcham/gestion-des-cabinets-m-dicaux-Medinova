package com.medinova.repository;

import com.medinova.entity.ExamenComplementaire;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ExamenComplementaireRepository extends JpaRepository<ExamenComplementaire, Long> {
    List<ExamenComplementaire> findByConsultationIdOrderByDatePrescriptionDesc(Long consultationId);
    
    @Query("SELECT e FROM ExamenComplementaire e WHERE e.consultation.patient.id = :patientId ORDER BY e.datePrescription DESC")
    List<ExamenComplementaire> findByPatientIdOrderByDatePrescriptionDesc(@Param("patientId") Long patientId);
}