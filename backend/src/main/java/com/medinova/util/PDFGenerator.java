package com.medinova.util;

import com.itextpdf.html2pdf.ConverterProperties;
import com.itextpdf.html2pdf.HtmlConverter;
import com.itextpdf.io.image.ImageDataFactory;
import com.itextpdf.kernel.pdf.PdfDocument;
import com.itextpdf.kernel.pdf.PdfWriter;
import com.itextpdf.layout.Document;
import com.itextpdf.layout.element.Image;
import com.itextpdf.layout.element.Paragraph;
import com.itextpdf.layout.element.Table;
import com.itextpdf.layout.properties.UnitValue;
import com.medinova.entity.Facture;
import com.medinova.entity.Ordonnance;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.io.FileOutputStream;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.format.DateTimeFormatter;

@Component
public class PDFGenerator {
    
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm");
    
    @Value("${medinova.signatures.dir:./signatures}")
    private String signaturesDir;
    
    public void generateOrdonnancePDF(Ordonnance ordonnance, String outputPath) throws IOException {
        try (PdfWriter writer = new PdfWriter(new FileOutputStream(outputPath));
             PdfDocument pdf = new PdfDocument(writer);
             Document document = new Document(pdf)) {
            
            // En-tête
            document.add(new Paragraph("ORDONNANCE MÉDICALE")
                    .setBold()
                    .setFontSize(16)
                    .setMarginBottom(20));
            
            // Informations médecin
            if (ordonnance.getMedecin() != null) {
                document.add(new Paragraph("Docteur: " + ordonnance.getMedecin().getNom() + " " + ordonnance.getMedecin().getPrenom()));
                if (ordonnance.getMedecin().getTelephone() != null) {
                    document.add(new Paragraph("Tél: " + ordonnance.getMedecin().getTelephone()));
                }
            }
            
            document.add(new Paragraph("Date: " + ordonnance.getDateEmission().format(DATE_FORMATTER))
                    .setMarginTop(10));
            
            // Informations patient
            if (ordonnance.getConsultation() != null && ordonnance.getConsultation().getPatient() != null) {
                var patient = ordonnance.getConsultation().getPatient();
                document.add(new Paragraph("Patient: " + patient.getNom() + " " + patient.getPrenom())
                        .setMarginTop(10));
                document.add(new Paragraph("CIN: " + patient.getCin()));
            }
            
            // Prescription
            if (ordonnance.getConsultation() != null && ordonnance.getConsultation().getPrescription() != null) {
                document.add(new Paragraph("Prescription:")
                        .setBold()
                        .setMarginTop(20));
                document.add(new Paragraph(ordonnance.getConsultation().getPrescription()));
            }
            
            // Lignes d'ordonnance
            if (ordonnance.getLignes() != null && !ordonnance.getLignes().isEmpty()) {
                document.add(new Paragraph("Médicaments:")
                        .setBold()
                        .setMarginTop(20));
                
                Table table = new Table(3);
                table.addHeaderCell("Médicament");
                table.addHeaderCell("Quantité");
                table.addHeaderCell("Posologie");
                
                for (var ligne : ordonnance.getLignes()) {
                    if (ligne.getMedicament() != null) {
                        table.addCell(ligne.getMedicament().getNom());
                        table.addCell(String.valueOf(ligne.getQuantite()));
                        table.addCell(ligne.getPosologie() != null ? ligne.getPosologie() : "");
                    }
                }
                document.add(table);
            }
            
            // Instructions
            if (ordonnance.getInstructions() != null && !ordonnance.getInstructions().isEmpty()) {
                document.add(new Paragraph("Instructions:")
                        .setBold()
                        .setMarginTop(20));
                document.add(new Paragraph(ordonnance.getInstructions()));
            }
            
            // Signature numérique
            document.add(new Paragraph("\n\n")
                    .setMarginTop(50));
            
            // Essayer de charger une image de signature si elle existe
            Image signatureImage = null;
            if (ordonnance.getMedecin() != null) {
                try {
                    // Chercher une image de signature pour ce médecin
                    // Format attendu: signatures/medecin_{medecinId}.png ou .jpg
                    Path signaturesPath = Paths.get(signaturesDir);
                    if (!Files.exists(signaturesPath)) {
                        Files.createDirectories(signaturesPath);
                    }
                    
                    Path signaturePath = signaturesPath.resolve("medecin_" + ordonnance.getMedecin().getId() + ".png");
                    if (!Files.exists(signaturePath)) {
                        signaturePath = signaturesPath.resolve("medecin_" + ordonnance.getMedecin().getId() + ".jpg");
                    }
                    
                    if (Files.exists(signaturePath)) {
                        signatureImage = new Image(ImageDataFactory.create(signaturePath.toAbsolutePath().toString()));
                        signatureImage.setWidth(UnitValue.createPointValue(150));
                        signatureImage.setHeight(UnitValue.createPointValue(60));
                        signatureImage.setMarginTop(10);
                    }
                } catch (Exception e) {
                    System.out.println("Impossible de charger l'image de signature: " + e.getMessage());
                    e.printStackTrace();
                }
            }
            
            // Ligne de séparation
            document.add(new Paragraph("_________________________________")
                    .setMarginTop(20));
            
            // Ajouter l'image de signature si disponible
            if (signatureImage != null) {
                document.add(signatureImage);
            }
            
            // Informations de signature
            if (ordonnance.getMedecin() != null) {
                document.add(new Paragraph("Dr. " + ordonnance.getMedecin().getPrenom() + " " + ordonnance.getMedecin().getNom())
                        .setBold()
                        .setMarginTop(signatureImage != null ? 5 : 20));
            }
            
            document.add(new Paragraph("Date et heure: " + ordonnance.getDateEmission().format(DATE_FORMATTER))
                    .setFontSize(10)
                    .setMarginTop(5));
            
            if (signatureImage == null) {
                document.add(new Paragraph("Signature numérique")
                        .setFontSize(8)
                        .setItalic()
                        .setMarginTop(2));
            } else {
                document.add(new Paragraph("Signature numérique validée")
                        .setFontSize(8)
                        .setItalic()
                        .setMarginTop(2));
            }
            
            // Numéro d'ordonnance pour traçabilité
            document.add(new Paragraph("\nN° Ordonnance: " + ordonnance.getId())
                    .setFontSize(8)
                    .setMarginTop(10));
        }
    }
    
    public void generateFacturePDF(Facture facture, String outputPath) throws IOException {
        try (PdfWriter writer = new PdfWriter(new FileOutputStream(outputPath));
             PdfDocument pdf = new PdfDocument(writer);
             Document document = new Document(pdf)) {
            
            // =========================
            // EN-TÊTE MEDINOVA + CABINET
            // =========================
            
            // Marque de la plateforme
            document.add(new Paragraph("Medinova - Gestion des cabinets médicaux")
                    .setBold()
                    .setFontSize(14)
                    .setMarginBottom(5));
            
            // Informations du cabinet (via le patient si disponible)
            if (facture.getPatient() != null && facture.getPatient().getCabinet() != null) {
                var cabinet = facture.getPatient().getCabinet();
                document.add(new Paragraph("Cabinet médical : " + cabinet.getNom())
                        .setFontSize(11));
                if (cabinet.getAdresse() != null) {
                    document.add(new Paragraph("Adresse : " + cabinet.getAdresse())
                            .setFontSize(10));
                }
                if (cabinet.getTelephone() != null) {
                    document.add(new Paragraph("Tél : " + cabinet.getTelephone())
                            .setFontSize(10));
                }
                if (cabinet.getEmail() != null) {
                    document.add(new Paragraph("Email : " + cabinet.getEmail())
                            .setFontSize(10));
                }
            }
            
            // Espacement
            document.add(new Paragraph(" ")
                    .setMarginTop(5));
            
            // Titre FACTURE
            document.add(new Paragraph("FACTURE")
                    .setBold()
                    .setFontSize(16)
                    .setMarginBottom(20));
            
            // Numéro de facture
            document.add(new Paragraph("N° " + facture.getNumero())
                    .setBold());
            
            // Date
            document.add(new Paragraph("Date: " + facture.getDateEmission().format(DATE_FORMATTER))
                    .setMarginTop(10));
            
            // Informations patient
            if (facture.getPatient() != null) {
                var patient = facture.getPatient();
                document.add(new Paragraph("Patient: " + patient.getNom() + " " + patient.getPrenom())
                        .setMarginTop(10));
                document.add(new Paragraph("CIN: " + patient.getCin()));
                if (patient.getAdresse() != null) {
                    document.add(new Paragraph("Adresse: " + patient.getAdresse()));
                }
            }
            
            // Détails
            document.add(new Paragraph("Détails:")
                    .setBold()
                    .setMarginTop(20));
            
            Table table = new Table(3);
            table.addHeaderCell("Description");
            table.addHeaderCell("Montant HT");
            table.addHeaderCell("TVA");
            
            table.addCell("Consultation");
            table.addCell(facture.getMontantHT().toString() + " DH");
            table.addCell(facture.getTauxTVA().multiply(java.math.BigDecimal.valueOf(100)).toString() + "%");
            
            document.add(table);
            
            // Totaux
            document.add(new Paragraph("\n\nMontant HT: " + facture.getMontantHT() + " DH")
                    .setMarginTop(10));
            document.add(new Paragraph("TVA: " + facture.getTauxTVA().multiply(java.math.BigDecimal.valueOf(100)) + "%"));
            
            java.math.BigDecimal montantTVA = facture.getMontantTTC().subtract(facture.getMontantHT());
            document.add(new Paragraph("Montant TVA: " + montantTVA + " DH"));
            document.add(new Paragraph("Montant TTC: " + facture.getMontantTTC() + " DH")
                    .setBold()
                    .setFontSize(14));
            
            // Statut
            document.add(new Paragraph("\nStatut: " + facture.getStatutPaiement())
                    .setMarginTop(10));
            
            if (facture.getNotes() != null && !facture.getNotes().isEmpty()) {
                document.add(new Paragraph("Notes: " + facture.getNotes())
                        .setMarginTop(10));
            }
            
            // =========================
            // SIGNATURES / CACHETS
            // =========================
            document.add(new Paragraph("\n\n"));
            document.add(new Paragraph("Signatures et cachets")
                    .setBold()
                    .setMarginBottom(10));
            
            Table signaturesTable = new Table(2);
            signaturesTable.addHeaderCell(new Paragraph("Cachet / Signature Medinova")
                    .setBold()
                    .setFontSize(10));
            signaturesTable.addHeaderCell(new Paragraph("Cachet / Signature du cabinet")
                    .setBold()
                    .setFontSize(10));
            
            // Laisser de l'espace pour les signatures / tampons physiques
            signaturesTable.addCell(new Paragraph("\n\n\n\n"));
            signaturesTable.addCell(new Paragraph("\n\n\n\n"));
            
            document.add(signaturesTable);
        }
    }
}