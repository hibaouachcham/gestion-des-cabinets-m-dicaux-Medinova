package com.medinova.service;

import com.medinova.dto.ConsultationDTO;
import com.medinova.dto.DoctorStatsDTO;
import com.medinova.dto.RendezVousDTO;
import com.medinova.entity.Consultation;
import com.medinova.entity.Utilisateur;
import com.medinova.repository.*;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class DoctorService {
    
    private final ConsultationRepository consultationRepository;
    private final PatientRepository patientRepository;
    private final OrdonnanceRepository ordonnanceRepository;
    private final RendezVousRepository rendezVousRepository;
    private final FileAttenteRepository fileAttenteRepository;
    private final UtilisateurRepository utilisateurRepository;
    
    public DoctorService(ConsultationRepository consultationRepository,
                        PatientRepository patientRepository,
                        OrdonnanceRepository ordonnanceRepository,
                        RendezVousRepository rendezVousRepository,
                        FileAttenteRepository fileAttenteRepository,
                        UtilisateurRepository utilisateurRepository) {
        this.consultationRepository = consultationRepository;
        this.patientRepository = patientRepository;
        this.ordonnanceRepository = ordonnanceRepository;
        this.rendezVousRepository = rendezVousRepository;
        this.fileAttenteRepository = fileAttenteRepository;
        this.utilisateurRepository = utilisateurRepository;
    }
    
    @Transactional(readOnly = true)
    public DoctorStatsDTO getStats() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur medecin = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        Long medecinId = medecin.getId();
        Long cabinetId = medecin.getCabinet() != null ? medecin.getCabinet().getId() : null;
        
        // Dates pour les calculs
        LocalDate aujourdhui = LocalDate.now();
        LocalDateTime debutJour = LocalDateTime.of(aujourdhui, LocalTime.MIN);
        LocalDateTime finJour = LocalDateTime.of(aujourdhui, LocalTime.MAX);
        
        LocalDateTime debutSemaine = debutJour.minusDays(aujourdhui.getDayOfWeek().getValue() - 1);
        LocalDateTime finSemaine = finJour.plusDays(7 - aujourdhui.getDayOfWeek().getValue());
        
        LocalDateTime debutMois = LocalDateTime.of(aujourdhui.withDayOfMonth(1), LocalTime.MIN);
        LocalDateTime finMois = LocalDateTime.of(aujourdhui.withDayOfMonth(aujourdhui.lengthOfMonth()), LocalTime.MAX);
        
        // 1. Consultations aujourd'hui
        List<Consultation> consultationsAujourdhui = consultationRepository.findByMedecinIdOrderByDateConsultationDesc(medecinId)
                .stream()
                .filter(c -> {
                    if (c.getDateConsultation() == null) return false;
                    LocalDateTime dateConsult = c.getDateConsultation();
                    return !dateConsult.isBefore(debutJour) && !dateConsult.isAfter(finJour);
                })
                .collect(Collectors.toList());
        
        // 2. Consultations cette semaine
        List<Consultation> consultationsCetteSemaine = consultationRepository.findByMedecinIdOrderByDateConsultationDesc(medecinId)
                .stream()
                .filter(c -> {
                    if (c.getDateConsultation() == null) return false;
                    LocalDateTime dateConsult = c.getDateConsultation();
                    return !dateConsult.isBefore(debutSemaine) && !dateConsult.isAfter(finSemaine);
                })
                .collect(Collectors.toList());
        
        // 3. Consultations ce mois
        List<Consultation> consultationsCeMois = consultationRepository.findByMedecinIdOrderByDateConsultationDesc(medecinId)
                .stream()
                .filter(c -> {
                    if (c.getDateConsultation() == null) return false;
                    LocalDateTime dateConsult = c.getDateConsultation();
                    return !dateConsult.isBefore(debutMois) && !dateConsult.isAfter(finMois);
                })
                .collect(Collectors.toList());
        
        // 4. Patients en file d'attente
        Long patientsEnFileAttente = (long) fileAttenteRepository.findEnAttenteByMedecin(medecinId).size();
        
        // 5. Total patients du cabinet
        Long totalPatients = 0L;
        if (cabinetId != null) {
            totalPatients = patientRepository.findByCabinetId(cabinetId, PageRequest.of(0, Integer.MAX_VALUE))
                    .getTotalElements();
        }
        
        // 6. Ordonnances ce mois
        Long ordonnancesCeMois = consultationsCeMois.stream()
                .mapToLong(c -> c.getOrdonnances() != null ? c.getOrdonnances().size() : 0)
                .sum();
        
        // 7. Prochains rendez-vous (5 prochains)
        List<RendezVousDTO> prochainsRendezVous = List.of();
        if (medecinId != null) {
            prochainsRendezVous = rendezVousRepository.findByDateRange(
                    LocalDateTime.now(), null, medecinId, PageRequest.of(0, Integer.MAX_VALUE)
            ).getContent().stream()
                    .filter(r -> r.getStatut() == com.medinova.entity.RendezVous.Statut.PLANIFIE)
                    .sorted((r1, r2) -> r1.getDateHeure().compareTo(r2.getDateHeure()))
                    .limit(5)
                    .map(RendezVousDTO::fromEntity)
                    .collect(Collectors.toList());
        }
        
        // 8. Consultations récentes (5 dernières)
        List<ConsultationDTO> consultationsRecentes = consultationRepository.findByMedecinIdOrderByDateConsultationDesc(medecinId)
                .stream()
                .limit(5)
                .map(ConsultationDTO::fromEntity)
                .collect(Collectors.toList());
        
        DoctorStatsDTO stats = new DoctorStatsDTO();
        stats.setConsultationsAujourdhui((long) consultationsAujourdhui.size());
        stats.setConsultationsCetteSemaine((long) consultationsCetteSemaine.size());
        stats.setConsultationsCeMois((long) consultationsCeMois.size());
        stats.setPatientsEnFileAttente(patientsEnFileAttente);
        stats.setTotalPatients(totalPatients);
        stats.setOrdonnancesCeMois(ordonnancesCeMois);
        stats.setProchainsRendezVous(prochainsRendezVous);
        stats.setConsultationsRecentes(consultationsRecentes);
        
        return stats;
    }
}