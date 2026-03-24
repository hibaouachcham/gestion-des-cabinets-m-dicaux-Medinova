package com.medinova.service;

import com.medinova.dto.LoginRequest;
import com.medinova.dto.UserDTO;
import com.medinova.entity.Abonnement;
import com.medinova.entity.Utilisateur;
import com.medinova.repository.AbonnementRepository;
import com.medinova.repository.UtilisateurRepository;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {
    
    private final AuthenticationManager authenticationManager;
    private final UtilisateurRepository utilisateurRepository;
    private final AbonnementRepository abonnementRepository;
    
    public AuthService(AuthenticationManager authenticationManager,
                      UtilisateurRepository utilisateurRepository,
                      AbonnementRepository abonnementRepository) {
        this.authenticationManager = authenticationManager;
        this.utilisateurRepository = utilisateurRepository;
        this.abonnementRepository = abonnementRepository;
    }
    
    public UserDTO login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        
        Utilisateur utilisateur = utilisateurRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new RuntimeException("Utilisateur non trouvé"));
        
        // Vérifier le statut de l'abonnement pour les médecins et secrétaires
        // L'administrateur n'est pas soumis à cette vérification
        if (utilisateur.getRole() != Utilisateur.Role.ROLE_ADMIN && utilisateur.getCabinet() != null) {
            Abonnement abonnement = abonnementRepository.findByCabinetId(utilisateur.getCabinet().getId())
                    .orElse(null);
            
            if (abonnement == null || !abonnement.isActif()) {
                SecurityContextHolder.clearContext();
                throw new RuntimeException("L'abonnement de votre cabinet n'est pas actif. Veuillez contacter l'administrateur.");
            }
        }
        
        return UserDTO.fromEntity(utilisateur);
    }
    
    public void logout() {
        SecurityContextHolder.clearContext();
    }
    
    @Transactional(readOnly = true)
    public UserDTO getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || 
            authentication.getName().equals("anonymousUser")) {
            return null; // Retourne null au lieu de lancer une exception
        }
        
        String username = authentication.getName();
        Utilisateur utilisateur = utilisateurRepository.findByUsername(username)
                .orElse(null); // Retourne null si non trouvé
        
        if (utilisateur == null) {
            return null;
        }
        
        return UserDTO.fromEntity(utilisateur);
    }
}

