package com.example.Doanlesg.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;
import jakarta.servlet.http.HttpSession;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/ver0.0.1")
@CrossOrigin(origins = "http://localhost:3000") // React dev server
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request, HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        try {
            String email = request.get("username");
            String password = request.get("password");

            Authentication auth = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(email, password)
            );
            session.setAttribute("user", auth.getName());

            SecurityContextHolder.getContext().setAuthentication(auth);

            response.put("success", true);
            response.put("message", "Đăng nhập thành công");
            response.put("user", auth.getName());

            return ResponseEntity.ok(response);

        } catch (Exception e) {
            response.put("success", false);
            response.put("message", "Email hoặc mật khẩu không đúng");
            return ResponseEntity.badRequest().body(response);
        }
    }
}
