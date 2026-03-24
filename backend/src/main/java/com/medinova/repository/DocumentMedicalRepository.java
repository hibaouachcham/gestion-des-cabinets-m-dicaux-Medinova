package com.medinova.repository;

import com.medinova.entity.DocumentMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DocumentMedicalRepository extends JpaRepository<DocumentMedical, Long> {
    List<DocumentMedical> findByDossierId(Long dossierId);
}

