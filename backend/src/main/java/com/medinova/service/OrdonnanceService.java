package com.medinova.service;

import com.medinova.dto.CreateOrdonnanceRequest;
import com.medinova.dto.OrdonnanceDTO;
import com.medinova.entity.Consultation;
import com.medinova.entity.LigneOrdonnance;
import com.medinova.entity.Medicament;
import com.medinova.entity.Ordonnance;
import com.medinova.entity.Utilisateur;
import com.medinova.repository.ConsultationRepository;
import com.medinova.repository.MedicamentRepository;
import com.medinova.repository.OrdonnanceRepository;
import com.medinova.util.PDFGenerator;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;

@Service
@Transactional
public class OrdonnanceService {
    
    private final OrdonnanceRepository ordonnanceRepository;
    private final ConsultationRepository consultationRepository;
    private final MedicamentRepository medicamentRepository;
    private final PDFGenerator pdfGenerator;
    
    @Value("${medinova.pdf.output-dir:./pdf-output}")
    private String pdfOutputDir;
    
    public OrdonnanceService(OrdonnanceRepository ordonnanceRepository,
                            ConsultationRepository consultationRepository,
                            MedicamentRepository medicamentRepository,
                            PDFGenerator pdfGenerator) {
        this.ordonnanceRepository = ordonnanceRepository;
        this.consultationRepository = consultationRepository;
        this.medicamentRepository = medicamentRepository;
        this.pdfGenerator = pdfGenerator;
    }
    
    public OrdonnanceDTO createOrdonnance(CreateOrdonnanceRequest request) {
        Consultation consultation = consultationRepository.findById(request.getConsultationId())
                .orElseThrow(() -> new RuntimeException("Consultation non trouvée"));
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur medecin = consultation.getMedecin();
        
        Ordonnance ordonnance = new Ordonnance();
        ordonnance.setConsultation(consultation);
        ordonnance.setMedecin(medecin);
        ordonnance.setInstructions(request.getInstructions());
        
        if (request.getLignes() != null && !request.getLignes().isEmpty()) {
            List<LigneOrdonnance> lignes = request.getLignes().stream()
                    .map(l -> {
                        Medicament medicament = medicamentRepository.findById(l.getMedicamentId())
                                .orElseThrow(() -> new RuntimeException("Médicament non trouvé: " + l.getMedicamentId()));
                        LigneOrdonnance ligne = new LigneOrdonnance();
                        ligne.setOrdonnance(ordonnance);
                        ligne.setMedicament(medicament);
                        ligne.setQuantite(l.getQuantite());
                        ligne.setPosologie(l.getPosologie());
                        ligne.setDuree(l.getDuree());
                        return ligne;
                    })
                    .toList();
            ordonnance.setLignes(lignes);
        }
        
        Ordonnance saved = ordonnanceRepository.save(ordonnance);
        return OrdonnanceDTO.fromEntity(saved);
    }
    
    @Transactional(readOnly = true)
    public OrdonnanceDTO getOrdonnanceById(Long id) {
        Ordonnance ordonnance = ordonnanceRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ordonnance non trouvée"));
        return OrdonnanceDTO.fromEntity(ordonnance);
    }
    
    @Transactional(readOnly = true)
    public List<OrdonnanceDTO> getOrdonnancesByConsultation(Long consultationId) {
        List<Ordonnance> ordonnances = ordonnanceRepository.findByConsultationId(consultationId);
        return ordonnances.stream()
                .map(OrdonnanceDTO::fromEntity)
                .toList();
    }
    
    public Resource generatePDF(Long ordonnanceId) {
        Ordonnance ordonnance = ordonnanceRepository.findById(ordonnanceId)
                .orElseThrow(() -> new RuntimeException("Ordonnance non trouvée"));
        
        try {
            String filename = "ordonnance_" + ordonnanceId + ".pdf";
            Path pdfPath = Paths.get(pdfOutputDir).resolve(filename);
            pdfPath.getParent().toFile().mkdirs();
            
            pdfGenerator.generateOrdonnancePDF(ordonnance, pdfPath.toString());
            
            Resource resource = new UrlResource(pdfPath.toUri());
            if (resource.exists() && resource.isReadable()) {
                return resource;
            } else {
                throw new RuntimeException("Le fichier PDF n'a pas pu être généré");
            }
        } catch (Exception e) {
            throw new RuntimeException("Erreur lors de la génération du PDF: " + e.getMessage(), e);
        }
    }
}