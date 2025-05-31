package com.example.Doanlesg.Config; // Hoặc package cấu hình của bạn

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import static org.springframework.security.config.Customizer.withDefaults;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;

@Configuration
public class SecurityConfig{
    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Tạm thời vô hiệu hóa CSRF cho API
                .authorizeHttpRequests(authz -> authz
                        .requestMatchers("/api/v1/customers/**").permitAll() // Cho phép tất cả request tới API customers
                        // .requestMatchers("/api/v1/public/**").permitAll() // Ví dụ các API public khác
                        .anyRequest().authenticated() // Các request khác cần xác thực
                )
                .httpBasic(withDefaults()); // Ví dụ: Sử dụng HTTP Basic authentication cho các endpoint cần xác thực
        // Hoặc .formLogin(withDefaults()); nếu bạn muốn dùng form login

        return http.build();
    }

}
