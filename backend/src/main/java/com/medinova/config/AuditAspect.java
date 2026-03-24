package com.medinova.config;

import org.aspectj.lang.JoinPoint;
import org.aspectj.lang.annotation.Aspect;
import org.aspectj.lang.annotation.Before;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Aspect
@Component
public class AuditAspect {
    
    private static final Logger logger = LoggerFactory.getLogger(AuditAspect.class);
    
    @Before("execution(* com.medinova.controller.AuthController.login(..))")
    public void logLogin(JoinPoint joinPoint) {
        Object[] args = joinPoint.getArgs();
        if (args.length > 0) {
            logger.info("Tentative de connexion pour l'utilisateur: {}", args[0]);
        }
    }
    
    @Before("execution(* com.medinova.controller.AuthController.logout(..))")
    public void logLogout(JoinPoint joinPoint) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            logger.info("Déconnexion de l'utilisateur: {}", auth.getName());
        }
    }
    
    @Before("execution(* com.medinova.service.PatientService.createPatient(..))")
    public void logCreatePatient(JoinPoint joinPoint) {
        logAction("Création de patient", joinPoint);
    }
    
    @Before("execution(* com.medinova.service.FactureService.createFacture(..))")
    public void logCreateFacture(JoinPoint joinPoint) {
        logAction("Création de facture", joinPoint);
    }
    
    @Before("execution(* com.medinova.service.OrdonnanceService.generatePDF(..))")
    public void logGenerateOrdonnance(JoinPoint joinPoint) {
        logAction("Génération d'ordonnance PDF", joinPoint);
    }
    
    @Before("execution(* com.medinova.service.FactureService.generatePDF(..))")
    public void logGenerateFacturePDF(JoinPoint joinPoint) {
        logAction("Génération de facture PDF", joinPoint);
    }
    
    private void logAction(String action, JoinPoint joinPoint) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = auth != null ? auth.getName() : "ANONYMOUS";
        logger.info("AUDIT - {} par l'utilisateur: {}", action, username);
    }
}

