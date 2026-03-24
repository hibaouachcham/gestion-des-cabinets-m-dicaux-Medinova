package com.medinova.repository;

import com.medinova.entity.CabinetMedical;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CabinetMedicalRepository extends JpaRepository<CabinetMedical, Long> {
}

