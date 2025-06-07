package com.example.Doanlesg.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
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
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .authorizeHttpRequests(authorize -> authorize
                        // Add "/login.html" to the permitAll list
                        .requestMatchers("/", "/home", "/login.html", "/css/**", "/js/**", "/images/**", "/vendor/**","/login","/api/**").permitAll()
                        .requestMatchers("/admin").hasRole("ADMIN")
                        .anyRequest().permitAll()
                )
                // config login
                .formLogin(form -> form
                        // CORRECTED: Remove /static. Spring finds it automatically.
                        .loginPage("/login.html")
                        .usernameParameter("EMAIL")
                        .passwordParameter("PASSWORD")
                        .loginProcessingUrl("/LoginController") // This is where the form should POST to
                        .defaultSuccessUrl("/home",true)
                        .failureUrl("/login?error=true")
                )
            // CẤU HÌNH ĐĂNG XUẤT
                .logout(logout -> logout
                        .logoutUrl("/logout") // Đường dẫn để thực hiện đăng xuất
                        .logoutSuccessUrl("/login?logout") // Trang chuyển đến sau khi đăng xuất thành công
                        .invalidateHttpSession(true)
                        .deleteCookies("CUSTOMER_ID") // Xóa cookie JSESSIONID sau khi đăng xuất
                        .permitAll()
                );
        return http.build();
    }
}
