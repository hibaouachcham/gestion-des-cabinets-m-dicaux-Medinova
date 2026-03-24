package com.medinova.repository;

import com.medinova.entity.Medicament;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface MedicamentRepository extends JpaRepository<Medicament, Long> {
    
    @Query("SELECT m FROM Medicament m WHERE " +
           "m.disponible = true AND " +
           "(:q IS NULL OR :q = '' OR " +
           "LOWER(m.nom) LIKE LOWER(CONCAT('%', :q, '%')) OR " +
           "LOWER(m.code) LIKE LOWER(CONCAT('%', :q, '%')))")
    List<Medicament> search(@Param("q") String query);
    
    Optional<Medicament> findByCode(String code);
    
    boolean existsByCode(String code);
}

