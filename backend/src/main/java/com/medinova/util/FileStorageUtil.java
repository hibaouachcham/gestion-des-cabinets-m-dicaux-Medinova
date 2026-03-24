package com.medinova.util;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Component
public class FileStorageUtil {
    
    @Value("${medinova.upload.dir:./uploads}")
    private String uploadDir;
    
    public String storeFile(MultipartFile file, Long patientId) throws IOException {
        String originalFilename = file.getOriginalFilename();
        if (originalFilename == null || originalFilename.isEmpty()) {
            throw new RuntimeException("Nom de fichier invalide");
        }
        
        String extension = "";
        int lastDot = originalFilename.lastIndexOf('.');
        if (lastDot > 0) {
            extension = originalFilename.substring(lastDot);
        }
        
        String filename = UUID.randomUUID().toString() + extension;
        Path patientDir = Paths.get(uploadDir, patientId.toString());
        Files.createDirectories(patientDir);
        
        Path targetLocation = patientDir.resolve(filename);
        Files.copy(file.getInputStream(), targetLocation, StandardCopyOption.REPLACE_EXISTING);
        
        return targetLocation.toString();
    }
    
    public Path getFilePath(String filename, Long patientId) {
        return Paths.get(uploadDir, patientId.toString(), filename);
    }
    
    public void deleteFile(String filepath) throws IOException {
        Path path = Paths.get(filepath);
        if (Files.exists(path)) {
            Files.delete(path);
        }
    }
}

