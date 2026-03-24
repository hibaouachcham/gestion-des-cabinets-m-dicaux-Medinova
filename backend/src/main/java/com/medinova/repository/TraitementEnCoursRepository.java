package com.medinova.repository;

import com.medinova.entity.TraitementEnCours;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TraitementEnCoursRepository extends JpaRepository<TraitementEnCours, Long> {
    List<TraitementEnCours> findByDossierId(Long dossierId);
    List<TraitementEnCours> findByDossierIdAndActifTrue(Long dossierId);
}

