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

    private final Map<String, Object> userDetails;

    private final static String IS_AUTHENTICATED = "isAuthenticated";
    private final static String SUCCESS = "success";

    public AuthController(AccountServices accountServices) {
        this.accountServices = accountServices;
        userDetails = new HashMap<>();
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

            response.put(SUCCESS, true);
            response.put("message", "Đăng nhập thành công");

            userDetails.put("email", account.getEmail());
            userDetails.put("roles", getRolesForAccount(account));
            userDetails.put("fullName", account.getFullName()); // Uses your new method
            userDetails.put("phone", account.getPhoneNumber());     // Uses your new method
            response.put("user", userDetails);

            return ResponseEntity.ok(response);
        } else {
            response.put(SUCCESS, false);
            response.put("message", "Email, mật khẩu không đúng hoặc tài khoản đã bị khóa.");
            return ResponseEntity.status(401).body(response);
        }
    }

    @GetMapping("/auth/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus(HttpSession session) {
        Map<String, Object> response = new HashMap<>();
        Long accountId = (Long) session.getAttribute("account_id");

        if (accountId != null && userDetails.containsKey("email")) {
            Account account = accountServices.findById(accountId);
            if (account != null && account.isStatus()) {
                response.put(IS_AUTHENTICATED, true);
            } else {
                response.put(IS_AUTHENTICATED, false);
                session.invalidate();
            }
        } else {
            response.put(IS_AUTHENTICATED, false);
        }
        return ResponseEntity.ok(response);
    }

    // ... (logout and getRolesForAccount methods remain the same) ...
    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();
        HttpSession session = request.getSession(false);

        if (session != null) {
            session.invalidate();
        }

        response.put(SUCCESS, true);
        response.put("message", "Đăng xuất thành công");
        return ResponseEntity.ok(response);
    }

    private String getRolesForAccount(Account account) {
        if (account.getAdmin() != null) {
            return "ROLE_ADMIN";
        }
        if (account.getStaff() != null) {
            return "ROLE_STAFF";
        }
        if (account.getCustomer() != null) {
            return "ROLE_CUSTOMER";
        }
        return "";
    }
}