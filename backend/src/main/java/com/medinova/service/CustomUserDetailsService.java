package com.medinova.service;

import com.medinova.entity.Utilisateur;
import com.medinova.repository.UtilisateurRepository;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {
    
    private final UtilisateurRepository utilisateurRepository;
    
    public CustomUserDetailsService(UtilisateurRepository utilisateurRepository) {
        this.utilisateurRepository = utilisateurRepository;
    }
    
    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Utilisateur utilisateur = utilisateurRepository.findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Utilisateur non trouvé: " + username));
        
        if (!utilisateur.isActive()) {
            throw new UsernameNotFoundException("Utilisateur désactivé: " + username);
        }
        
        List<GrantedAuthority> authorities = Collections.singletonList(
                new SimpleGrantedAuthority(utilisateur.getRole().name())
        );
        
        return User.builder()
                .username(utilisateur.getUsername())
                .password(utilisateur.getPassword())
                .authorities(authorities)
                .accountExpired(false)
                .accountLocked(false)
                .credentialsExpired(false)
                .disabled(!utilisateur.isActive())
                .build();
    }
}

