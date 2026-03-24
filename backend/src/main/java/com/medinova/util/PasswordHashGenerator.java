package com.medinova.util;

import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;

/**
 * Utilitaire pour générer des hashs BCrypt
 * Utilisation: Exécuter la méthode main pour générer les hashs des mots de passe
 */
public class PasswordHashGenerator {
    
    public static void main(String[] args) {
        BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();
        
        System.out.println("=== Génération des hashs BCrypt ===");
        System.out.println();
        System.out.println("passwordAdmin:");
        System.out.println(encoder.encode("passwordAdmin"));
        System.out.println();
        System.out.println("passwordDoc:");
        System.out.println(encoder.encode("passwordDoc"));
        System.out.println();
        System.out.println("passwordSecr:");
        System.out.println(encoder.encode("passwordSecr"));
        System.out.println();
    }
}

