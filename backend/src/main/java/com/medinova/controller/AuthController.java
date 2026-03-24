package com.medinova.controller;

import com.medinova.dto.LoginRequest;
import com.medinova.dto.UserDTO;
import com.medinova.service.AuthService;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.context.HttpSessionSecurityContextRepository;
import org.springframework.security.web.csrf.CsrfToken;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"}, allowCredentials = "true")
public class AuthController {
    
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    @PostMapping("/login")
    public ResponseEntity<UserDTO> login(@Valid @RequestBody LoginRequest request,
                                        HttpServletRequest httpRequest,
                                        HttpServletResponse httpResponse) {
        // Log pour déboguer
        System.out.println("Login attempt - Username: " + (request != null ? request.getUsername() : "null"));
        System.out.println("Login attempt - Password: " + (request != null && request.getPassword() != null ? "***" : "null"));
        
        UserDTO user = authService.login(request);
        
        // CRITIQUE : Forcer explicitement le stockage du SecurityContext dans la session HTTP
        // Spring Security ne le fait pas automatiquement lors d'un login manuel via AuthenticationManager
        HttpSession session = httpRequest.getSession(true);
        if (session != null) {
            // Récupérer le SecurityContext actuel
            SecurityContext securityContext = SecurityContextHolder.getContext();
            
            // Stocker explicitement le SecurityContext dans la session
            HttpSessionSecurityContextRepository securityContextRepository = new HttpSessionSecurityContextRepository();
            securityContextRepository.saveContext(securityContext, httpRequest, httpResponse);
            
            // Configurer la session pour qu'elle reste active 24 heures
            session.setMaxInactiveInterval(24 * 60 * 60); // 24 heures (86400 secondes)
            
            // Forcer l'écriture du cookie de session
            session.setAttribute(HttpSessionSecurityContextRepository.SPRING_SECURITY_CONTEXT_KEY, securityContext);
            
            // Log pour déboguer (peut être supprimé en production)
            System.out.println("✅ Session créée - ID: " + session.getId());
            System.out.println("✅ SecurityContext stocké dans la session");
            System.out.println("✅ Authentification: " + securityContext.getAuthentication().getName());
        }
        
        return ResponseEntity.ok(user);
    }
    
    @PostMapping("/logout")
    public ResponseEntity<Map<String, String>> logout(HttpServletRequest request) {
        authService.logout();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        Map<String, String> response = new HashMap<>();
        response.put("message", "Déconnexion réussie");
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/me")
    public ResponseEntity<UserDTO> getCurrentUser() {
        UserDTO user = authService.getCurrentUser();
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(user);
    }
    
    @GetMapping("/csrf")
    public ResponseEntity<Map<String, String>> getCsrfToken(HttpServletRequest request) {
        CsrfToken csrfToken = (CsrfToken) request.getAttribute("_csrf");
        Map<String, String> response = new HashMap<>();
        if (csrfToken != null) {
            response.put("token", csrfToken.getToken());
            response.put("headerName", csrfToken.getHeaderName());
            response.put("parameterName", csrfToken.getParameterName());
        }
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/session-expired")
    public ResponseEntity<Map<String, String>> sessionExpired() {
        Map<String, String> response = new HashMap<>();
        response.put("message", "Session expirée");
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(response);
    }
}