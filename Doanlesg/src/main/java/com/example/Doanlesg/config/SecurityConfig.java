package com.example.Doanlesg.config; // Or your actual package for SecurityConfig

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Common for development, consider CSRF protection for production
                .authorizeHttpRequests(authorize -> authorize
                        .requestMatchers(
                                "/",
                                "/css/**",
                                "index.html",
                                "/js/**",
                                "/images/**",
                                "/vendor/**", // If you have a vendor folder for static resources
                                "/login",
                                "/register.html",// Explicitly permit direct access to register.html
                                "/register/createAccount",
                                "/createAccount",
                                "/register",
                                "/api/**"
                                // Permit all paths under RegisterController (e.g., /registerController/register, /registerController/createAccount)
                                // Add any other public paths here
                        ).permitAll()
                        .requestMatchers("/error","error.html").permitAll()
                        .requestMatchers("/admin/**").hasRole("ADMIN") // Example: restrict /admin/** to ADMIN role
                        .anyRequest().authenticated() // All other requests require authentication
                )
                .formLogin(form -> form
                        .loginPage("/login.html") // Your custom login page
                        .loginProcessingUrl("/perform_login") // URL to submit username and password to
                        .defaultSuccessUrl("/home/home", true) // Redirect after successful login
                        .failureUrl("/login.html?error=true") // Redirect after failed login
                        .permitAll()
                )
                .logout(logout -> logout
                        .logoutUrl("/perform_logout")
                        .logoutSuccessUrl("/login.html?logout")
                        .invalidateHttpSession(true)
                        .deleteCookies("JSESSIONID")
                        .permitAll()
                );
        return http.build();
    }
}