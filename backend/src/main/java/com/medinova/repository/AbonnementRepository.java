package com.medinova.repository;

import com.medinova.entity.Abonnement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AbonnementRepository extends JpaRepository<Abonnement, Long> {
    
    Optional<Abonnement> findByCabinetId(Long cabinetId);
    
    @Query("SELECT a FROM Abonnement a WHERE a.actif = true AND a.dateFin >= :today")
    List<Abonnement> findActiveSubscriptions(LocalDate today);
    
    @Query("SELECT a FROM Abonnement a WHERE a.actif = true AND a.dateFin < :today")
    List<Abonnement> findExpiredSubscriptions(LocalDate today);
    
    @Query("SELECT a FROM Abonnement a WHERE a.actif = true AND a.dateFin >= :today AND a.dateFin <= :alertDate")
    List<Abonnement> findSubscriptionsExpiringSoon(LocalDate today, LocalDate alertDate);
    
    @Query("SELECT COUNT(a) FROM Abonnement a WHERE a.actif = true AND a.dateFin >= :today")
    long countActiveSubscriptions(LocalDate today);
    
    @Query("SELECT COUNT(a) FROM Abonnement a WHERE a.actif = true AND a.dateFin < :today")
    long countExpiredSubscriptions(LocalDate today);
    
    @Query("SELECT COUNT(a) FROM Abonnement a WHERE a.actif = true AND a.dateFin >= :today AND a.dateFin <= :alertDate")
    long countSubscriptionsExpiringSoon(LocalDate today, LocalDate alertDate);
}

