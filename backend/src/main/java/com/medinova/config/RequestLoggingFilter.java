
package com.medinova.config;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.util.ContentCachingRequestWrapper;
import org.springframework.web.util.ContentCachingResponseWrapper;

import java.io.IOException;
import java.nio.charset.StandardCharsets;

@Component
@Order(1)
public class RequestLoggingFilter extends OncePerRequestFilter {

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        
        // Pour toutes les requêtes POST/PUT/PATCH avec body, utiliser ContentCachingRequestWrapper
        // pour permettre la lecture multiple du body par Spring Boot
        String method = request.getMethod();
        String contentType = request.getContentType();
        
        if (("POST".equalsIgnoreCase(method) || 
             "PUT".equalsIgnoreCase(method) || 
             "PATCH".equalsIgnoreCase(method)) &&
            contentType != null && 
            contentType.toLowerCase().contains("application/json")) {
            
            // Utiliser ContentCachingRequestWrapper pour permettre la lecture multiple du body
            ContentCachingRequestWrapper wrappedRequest = new ContentCachingRequestWrapper(request, 1024 * 1024); // 1MB buffer
            ContentCachingResponseWrapper wrappedResponse = new ContentCachingResponseWrapper(response);
            
            // Passer le wrappedRequest à la chaîne de filtres
            filterChain.doFilter(wrappedRequest, wrappedResponse);
            
            // Logging optionnel pour debug
            if (request.getRequestURI().contains("/api/consultations") || 
                request.getRequestURI().contains("/api/auth/login")) {
                byte[] contentAsByteArray = wrappedRequest.getContentAsByteArray();
                if (contentAsByteArray.length > 0) {
                    String body = new String(contentAsByteArray, StandardCharsets.UTF_8);
                    System.out.println("=== REQUEST BODY ===");
                    System.out.println("URI: " + request.getRequestURI());
                    System.out.println("Content-Type: " + wrappedRequest.getContentType());
                    System.out.println("Body: " + body);
                    System.out.println("====================");
                }
            }
            
            wrappedResponse.copyBodyToResponse();
        } else {
            filterChain.doFilter(request, response);
        }
    }
}