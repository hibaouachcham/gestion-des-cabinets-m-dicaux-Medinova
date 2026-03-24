package com.medinova.repository;

import com.medinova.entity.FileAttente;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FileAttenteRepository extends JpaRepository<FileAttente, Long> {
    
    @Query("SELECT f FROM FileAttente f WHERE f.dateTraitement IS NULL ORDER BY f.position ASC")
    List<FileAttente> findEnAttente();
    
    @Query("SELECT f FROM FileAttente f WHERE f.medecin.id = :medecinId AND f.dateTraitement IS NULL ORDER BY f.position ASC")
    List<FileAttente> findEnAttenteByMedecin(@Param("medecinId") Long medecinId);
    
    @Query("SELECT f FROM FileAttente f WHERE f.patient.id = :patientId AND f.dateTraitement IS NULL")
    Optional<FileAttente> findByPatientIdAndDateTraitementIsNull(@Param("patientId") Long patientId);
    
    @Query("SELECT COUNT(f) > 0 FROM FileAttente f WHERE f.patient.id = :patientId AND f.dateTraitement IS NULL")
    boolean existsByPatientIdAndDateTraitementIsNull(@Param("patientId") Long patientId);
    
    @Query("SELECT COUNT(f) FROM FileAttente f WHERE f.dateTraitement IS NULL")
    Integer countEnAttente();
}

