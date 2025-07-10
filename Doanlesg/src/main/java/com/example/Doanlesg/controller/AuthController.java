package com.example.Doanlesg.controller;

import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.services.AccountServices;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ver0.0.1")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class AuthController {

    private final AccountServices accountServices;

    public AuthController(AccountServices accountServices) {
        this.accountServices = accountServices;
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request, HttpServletRequest httpRequest) {
        Map<String, Object> response = new HashMap<>();
        String email = request.get("email");
        String password = request.get("password");
        Account account = accountServices.checkLogin(email, password);

        if (account != null && account.isStatus()) {
            HttpSession session = httpRequest.getSession(true);
            session.setAttribute("account_id", account.getId());

            response.put("success", true);
            response.put("message", "Đăng nhập thành công");
            response.put("user", createUserDetailsMap(account));

            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Email, mật khẩu không đúng hoặc tài khoản đã bị khóa.");
            return ResponseEntity.status(401).body(response);
        }
    }

    @GetMapping("/auth/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        Long accountId = (Long) session.getAttribute("account_id");

        if (accountId != null) {
            Account account = accountServices.findById(accountId);
            if (account != null && account.isStatus()) {
                response.put("isAuthenticated", true);
                // ✅ THIS IS THE FIX: The full user object is always returned.
                response.put("user", createUserDetailsMap(account));
            } else {
                response.put("isAuthenticated", false);
                session.invalidate();
            }
        } else {
            response.put("isAuthenticated", false);
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
        }
        response.put("success", true);
        response.put("message", "Đăng xuất thành công");
        return ResponseEntity.ok(response);
    }

    private Map<String, Object> createUserDetailsMap(Account account) {
        Map<String, Object> userDetails = new HashMap<>();
        userDetails.put("id", account.getId());
        userDetails.put("email", account.getEmail());
        userDetails.put("roles", getRolesForAccount(account));
        userDetails.put("fullName", account.getFullName());
        userDetails.put("phone", account.getPhoneNumber());
        return userDetails;
    }

    private List<String> getRolesForAccount(Account account) {
        List<String> roles = new ArrayList<>();
        if (account.getAdmin() != null) roles.add("ROLE_ADMIN");
        if (account.getStaff() != null) roles.add("ROLE_STAFF");
        if (account.getCustomer() != null) roles.add("ROLE_CUSTOMER");
        return roles;
    }
}