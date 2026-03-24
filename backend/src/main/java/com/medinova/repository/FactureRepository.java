package com.medinova.repository;

import com.medinova.entity.Facture;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.Optional;

@Repository
public interface FactureRepository extends JpaRepository<Facture, Long> {
    Optional<Facture> findByNumero(String numero);
    
    @EntityGraph(attributePaths = {"patient", "patient.cabinet", "consultation"})
    @Query("SELECT f FROM Facture f WHERE f.id = :id")
    Optional<Facture> findByIdWithRelations(@Param("id") Long id);
    
    @Query("SELECT DISTINCT f FROM Facture f " +
           "LEFT JOIN FETCH f.patient p " +
           "LEFT JOIN FETCH p.cabinet " +
           "LEFT JOIN FETCH f.consultation " +
           "WHERE " +
           "(:patientId IS NULL OR f.patient.id = :patientId) AND " +
           "(:cabinetId IS NULL OR p.cabinet.id = :cabinetId) AND " +
           "(:from IS NULL OR f.dateEmission >= :from) AND " +
           "(:to IS NULL OR f.dateEmission <= :to)")
    Page<Facture> findByFilters(@Param("patientId") Long patientId,
                                @Param("cabinetId") Long cabinetId,
                                @Param("from") LocalDateTime from,
                                @Param("to") LocalDateTime to,
                                Pageable pageable);
    
    Page<Facture> findByPatientId(Long patientId, Pageable pageable);
}

