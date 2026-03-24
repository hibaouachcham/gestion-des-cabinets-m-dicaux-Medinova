package com.medinova.service;

import com.medinova.dto.RendezVousDTO;
import com.medinova.dto.SecretaryStatsDTO;
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
public class SecretaryService {
    
    private final PatientRepository patientRepository;
    private final FileAttenteRepository fileAttenteRepository;
    private final RendezVousRepository rendezVousRepository;
    private final FactureRepository factureRepository;
    private final ConsultationRepository consultationRepository;
    private final UtilisateurRepository utilisateurRepository;
    
    public SecretaryService(PatientRepository patientRepository,
                           FileAttenteRepository fileAttenteRepository,
                           RendezVousRepository rendezVousRepository,
                           FactureRepository factureRepository,
                           ConsultationRepository consultationRepository,
                           UtilisateurRepository utilisateurRepository) {
        this.patientRepository = patientRepository;
        this.fileAttenteRepository = fileAttenteRepository;
        this.rendezVousRepository = rendezVousRepository;
        this.factureRepository = factureRepository;
        this.consultationRepository = consultationRepository;
        this.utilisateurRepository = utilisateurRepository;
    }
    
    @Transactional(readOnly = true)
    public SecretaryStatsDTO getStats() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        Utilisateur user = utilisateurRepository.findByUsername(auth.getName())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        if (user.getCabinet() == null) {
            throw new RuntimeException("Vous n'êtes pas affecté à un cabinet");
        }
        
        Long cabinetId = user.getCabinet().getId();
        
        // Récupérer le médecin du cabinet
        List<Utilisateur> medecins = utilisateurRepository.findByCabinetId(cabinetId)
                .stream()
                .filter(u -> u.getRole() == Utilisateur.Role.ROLE_DOCTOR)
                .collect(Collectors.toList());
        
        Long medecinId = medecins.isEmpty() ? null : medecins.get(0).getId();
        
        // Dates pour les calculs
        LocalDate aujourdhui = LocalDate.now();
        LocalDateTime debutJour = LocalDateTime.of(aujourdhui, LocalTime.MIN);
        LocalDateTime finJour = LocalDateTime.of(aujourdhui, LocalTime.MAX);
        
        LocalDateTime debutSemaine = debutJour.minusDays(aujourdhui.getDayOfWeek().getValue() - 1);
        LocalDateTime finSemaine = finJour.plusDays(7 - aujourdhui.getDayOfWeek().getValue());
        
        LocalDateTime debutMois = LocalDateTime.of(aujourdhui.withDayOfMonth(1), LocalTime.MIN);
        LocalDateTime finMois = LocalDateTime.of(aujourdhui.withDayOfMonth(aujourdhui.lengthOfMonth()), LocalTime.MAX);
        
        // 1. Nombre total de patients du cabinet
        Long totalPatients = patientRepository.findByCabinetId(cabinetId, PageRequest.of(0, Integer.MAX_VALUE))
                .getTotalElements();
        
        // 2. Nombre de patients en file d'attente
        Long patientsEnFileAttente = 0L;
        if (medecinId != null) {
            patientsEnFileAttente = (long) fileAttenteRepository.findEnAttenteByMedecin(medecinId).size();
        }
        
        // 3. Rendez-vous du jour
        Long rendezVousAujourdhui = 0L;
        if (medecinId != null) {
            rendezVousAujourdhui = rendezVousRepository.findByDateRange(
                    debutJour, finJour, medecinId, PageRequest.of(0, Integer.MAX_VALUE)
            ).getTotalElements();
        }
        
        // 4. Rendez-vous de la semaine
        Long rendezVousCetteSemaine = 0L;
        if (medecinId != null) {
            rendezVousCetteSemaine = rendezVousRepository.findByDateRange(
                    debutSemaine, finSemaine, medecinId, PageRequest.of(0, Integer.MAX_VALUE)
            ).getTotalElements();
        }
        
        // 5. Rendez-vous à venir (planifiés)
        Long rendezVousAVenir = 0L;
        if (medecinId != null) {
            rendezVousAVenir = rendezVousRepository.findByDateRange(
                    LocalDateTime.now(), null, medecinId, PageRequest.of(0, Integer.MAX_VALUE)
            ).getContent().stream()
                    .filter(r -> r.getStatut() == com.medinova.entity.RendezVous.Statut.PLANIFIE)
                    .count();
        }
        
        // 6. Factures du mois
        Long facturesCeMois = factureRepository.findByFilters(
                null, cabinetId, debutMois, finMois, PageRequest.of(0, Integer.MAX_VALUE)
        ).getTotalElements();
        
        // 7. Consultations du mois
        Long consultationsCeMois = 0L;
        if (medecinId != null) {
            consultationsCeMois = consultationRepository.findByMedecinIdOrderByDateConsultationDesc(medecinId)
                    .stream()
                    .filter(c -> {
                        if (c.getDateConsultation() == null) return false;
                        LocalDateTime dateConsult = c.getDateConsultation();
                        return !dateConsult.isBefore(debutMois) && !dateConsult.isAfter(finMois);
                    })
                    .count();
        }
        
        // 8. Prochains rendez-vous (5 prochains)
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
        
        SecretaryStatsDTO stats = new SecretaryStatsDTO();
        stats.setTotalPatients(totalPatients);
        stats.setPatientsEnFileAttente(patientsEnFileAttente);
        stats.setRendezVousAujourdhui(rendezVousAujourdhui);
        stats.setRendezVousCetteSemaine(rendezVousCetteSemaine);
        stats.setRendezVousAVenir(rendezVousAVenir);
        stats.setFacturesCeMois(facturesCeMois);
        stats.setConsultationsCeMois(consultationsCeMois);
        stats.setProchainsRendezVous(prochainsRendezVous);
        
        return stats;
    }
}

