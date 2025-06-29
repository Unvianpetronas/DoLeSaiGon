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
public class AuthController {

    private final AccountServices accountServices;

    public AuthController(AccountServices accountServices) {
        this.accountServices = accountServices;
    }

    // ... (login method is correct and remains the same)
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

            Map<String, Object> userDetails = new HashMap<>();
            userDetails.put("email", account.getEmail());
            userDetails.put("roles", getRolesForAccount(account));
            response.put("user", userDetails);

            return ResponseEntity.ok(response);
        } else {
            response.put("success", false);
            response.put("message", "Email, mật khẩu không đúng hoặc tài khoản đã bị khóa.");
            return ResponseEntity.status(401).body(response);
        }
    }


    /**
     * Endpoint for the frontend to check login status.
     * It now checks the HttpSession for an account ID and returns user details.
     */
    @GetMapping("/auth/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        Long accountId = (Long) session.getAttribute("account_id");

        if (accountId != null) {
            // Fetch the account from the database to get fresh data
            Account account = accountServices.findById(accountId);

            if (account != null && account.isStatus()) {
                // If account is valid, send back its details
                response.put("isAuthenticated", true);

                Map<String, Object> userDetails = new HashMap<>();
                userDetails.put("email", account.getEmail());
                userDetails.put("roles", getRolesForAccount(account));
                response.put("user", userDetails);
            } else {
                // Account not found or is inactive, treat as not authenticated
                response.put("isAuthenticated", false);
                session.invalidate(); // Clean up invalid session
            }
        } else {
            // No user in session
            response.put("isAuthenticated", false);
        }
        return ResponseEntity.ok(response);
    }

    // ... (logout and getRolesForAccount methods are correct and remain the same)
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

    private List<String> getRolesForAccount(Account account) {
        List<String> roles = new ArrayList<>();
        if (account.getAdmin() != null) {
            roles.add("ROLE_ADMIN");
        }
        if (account.getStaff() != null) {
            roles.add("ROLE_STAFF");
        }
        if (account.getCustomer() != null) {
            roles.add("ROLE_CUSTOMER");
        }
        return roles;
    }
}