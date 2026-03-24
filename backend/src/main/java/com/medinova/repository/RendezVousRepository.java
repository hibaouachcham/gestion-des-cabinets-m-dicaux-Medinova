package com.medinova.repository;

import com.medinova.entity.RendezVous;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface RendezVousRepository extends JpaRepository<RendezVous, Long> {
    
    @Query("SELECT r FROM RendezVous r WHERE " +
           "(:from IS NULL OR r.dateHeure >= :from) AND " +
           "(:to IS NULL OR r.dateHeure <= :to) AND " +
           "(:medecinId IS NULL OR r.medecin.id = :medecinId)")
    Page<RendezVous> findByDateRange(@Param("from") LocalDateTime from,
                                      @Param("to") LocalDateTime to,
                                      @Param("medecinId") Long medecinId,
                                      Pageable pageable);
    
    List<RendezVous> findByPatientIdOrderByDateHeureDesc(Long patientId);
    
    List<RendezVous> findByMedecinIdAndDateHeureBetween(Long medecinId, 
                                                         LocalDateTime start, 
                                                         LocalDateTime end);
}

