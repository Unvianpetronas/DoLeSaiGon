package com.example.Doanlesg.config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.CorsRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void addCorsMappings(CorsRegistry registry) {
        // Apply CORS policy to all API endpoints starting with /api/
        // Adjust "/api/**" if your API base path is different (e.g., "/ver0.0.1/**")
        registry.addMapping("/api/**")
                // Allow requests from your frontend's origin (http://localhost:8443)
                // In production, replace localhost:8443 with your actual frontend domain/IP.
                .allowedOrigins(
                        "http://localhost:3000",
                        "https://dolesaigon.io.vn"
                )
                // Define which HTTP methods are allowed (e.g., GET, POST, PUT, DELETE)
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                // Allow all headers in the request
                .allowedHeaders("*")
                // Allow sending credentials (cookies, HTTP authentication, client certificates)
                .allowCredentials(true)
                // Set max age for preflight OPTIONS requests (how long results can be cached)
                .maxAge(3600);

        // If you have another API base path, you might need another mapping
        registry.addMapping("/ver0.0.1/**") // Example for your specific API path
                .allowedOrigins(
                        "http://localhost:3000",
                        "https://dolesaigon.io.vn"
                )
                .allowedMethods("GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true);

    }
}
