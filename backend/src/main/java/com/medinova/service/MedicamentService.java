package com.medinova.service;

import com.medinova.entity.Medicament;
import com.medinova.repository.MedicamentRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class MedicamentService {
    
    private final MedicamentRepository medicamentRepository;
    
    public MedicamentService(MedicamentRepository medicamentRepository) {
        this.medicamentRepository = medicamentRepository;
    }
    
    @Transactional(readOnly = true)
    public List<Medicament> searchMedicaments(String query) {
        if (query == null || query.trim().isEmpty()) {
            return medicamentRepository.findAll().stream()
                    .filter(Medicament::isDisponible)
                    .collect(Collectors.toList());
        }
        return medicamentRepository.search(query);
    }
    
    @Transactional(readOnly = true)
    public List<Medicament> getAllMedicaments() {
        return medicamentRepository.findAll();
    }
    
    public Medicament createMedicament(Medicament medicament) {
        if (medicamentRepository.existsByCode(medicament.getCode())) {
            throw new RuntimeException("Un médicament avec ce code existe déjà");
        }
        return medicamentRepository.save(medicament);
    }
    
    public void importMedicaments(List<Medicament> medicaments) {
        for (Medicament m : medicaments) {
            if (!medicamentRepository.existsByCode(m.getCode())) {
                medicamentRepository.save(m);
            }
        }
    }
}

