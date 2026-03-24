package com.medinova.controller;

import com.medinova.entity.DocumentMedical;
import com.medinova.entity.DossierMedical;
import com.medinova.entity.Patient;
import com.medinova.entity.Utilisateur;
import com.medinova.repository.DocumentMedicalRepository;
import com.medinova.repository.DossierMedicalRepository;
import com.medinova.repository.PatientRepository;
import com.medinova.repository.UtilisateurRepository;
import com.medinova.util.FileStorageUtil;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/files")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class UploadController {
    
    private final FileStorageUtil fileStorageUtil;
    private final PatientRepository patientRepository;
    private final DossierMedicalRepository dossierRepository;
    private final DocumentMedicalRepository documentRepository;
    private final UtilisateurRepository utilisateurRepository;
    
    public UploadController(FileStorageUtil fileStorageUtil,
                           PatientRepository patientRepository,
                           DossierMedicalRepository dossierRepository,
                           DocumentMedicalRepository documentRepository,
                           UtilisateurRepository utilisateurRepository) {
        this.fileStorageUtil = fileStorageUtil;
        this.patientRepository = patientRepository;
        this.dossierRepository = dossierRepository;
        this.documentRepository = documentRepository;
        this.utilisateurRepository = utilisateurRepository;
    }
    
    @PostMapping("/upload")
    public ResponseEntity<Map<String, Object>> uploadFile(
            @RequestParam("file") MultipartFile file,
            @RequestParam("patientId") Long patientId,
            @RequestParam(required = false) String description) {
        
        try {
            Patient patient = patientRepository.findById(patientId)
                    .orElseThrow(() -> new RuntimeException("Patient non trouvé"));
            
            String filepath = fileStorageUtil.storeFile(file, patientId);
            
            DossierMedical dossier = dossierRepository.findByPatientId(patientId)
                    .orElseGet(() -> {
                        DossierMedical newDossier = new DossierMedical();
                        newDossier.setPatient(patient);
                        return dossierRepository.save(newDossier);
                    });
            
            Authentication auth = SecurityContextHolder.getContext().getAuthentication();
            Utilisateur uploadedBy = utilisateurRepository.findByUsername(auth.getName())
                    .orElse(null);
            
            DocumentMedical document = new DocumentMedical();
            document.setDossier(dossier);
            document.setNomFichier(file.getOriginalFilename());
            document.setCheminFichier(filepath);
            document.setType(file.getContentType());
            document.setTaille(file.getSize());
            document.setDescription(description);
            document.setUploadedBy(uploadedBy);
            
            documentRepository.save(document);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Fichier uploadé avec succès");
            response.put("filename", file.getOriginalFilename());
            response.put("documentId", document.getId());
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", "Erreur lors de l'upload: " + e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
    
    @GetMapping("/{patientId}/{filename}")
    public ResponseEntity<Resource> downloadFile(@PathVariable Long patientId,
                                                @PathVariable String filename) {
        try {
            Path filePath = fileStorageUtil.getFilePath(filename, patientId);
            Resource resource = new UrlResource(filePath.toUri());
            
            if (resource.exists() && resource.isReadable()) {
                return ResponseEntity.ok()
                        .contentType(MediaType.APPLICATION_OCTET_STREAM)
                        .header(HttpHeaders.CONTENT_DISPOSITION, 
                                "attachment; filename=\"" + filename + "\"")
                        .body(resource);
            } else {
                return ResponseEntity.notFound().build();
            }
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }
}

