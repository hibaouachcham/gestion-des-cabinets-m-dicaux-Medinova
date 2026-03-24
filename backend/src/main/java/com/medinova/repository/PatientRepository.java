package com.medinova.repository;

import com.medinova.entity.Patient;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PatientRepository extends JpaRepository<Patient, Long> {
    Optional<Patient> findByCin(String cin);
    boolean existsByCin(String cin);
    
    @Query("SELECT p FROM Patient p WHERE " +
           "(:search IS NULL OR :search = '' OR " +
           "LOWER(p.nom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.prenom) LIKE LOWER(CONCAT('%', :search, '%')) OR " +
           "LOWER(p.cin) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "AND (:cabinetId IS NULL OR p.cabinet.id = :cabinetId OR p.cabinet IS NULL)")
    Page<Patient> searchPatients(@Param("search") String search, 
                                  @Param("cabinetId") Long cabinetId, 
                                  Pageable pageable);
    
    Page<Patient> findByCabinetId(Long cabinetId, Pageable pageable);
}

