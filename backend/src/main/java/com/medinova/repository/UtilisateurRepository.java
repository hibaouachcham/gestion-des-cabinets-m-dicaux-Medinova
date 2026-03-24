package com.medinova.repository;

import com.medinova.entity.Utilisateur;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UtilisateurRepository extends JpaRepository<Utilisateur, Long> {
    Optional<Utilisateur> findByUsername(String username);
    boolean existsByUsername(String username);
    List<Utilisateur> findByCabinetId(Long cabinetId);
    List<Utilisateur> findByRole(Utilisateur.Role role);
    
    @EntityGraph(attributePaths = {"cabinet"})
    @Override
    List<Utilisateur> findAll();
}

