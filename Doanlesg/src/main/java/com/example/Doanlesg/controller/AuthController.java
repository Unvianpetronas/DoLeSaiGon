package com.example.Doanlesg.controller;

import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.services.AccountServices;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/ver0.0.1")
public class AuthController {

    private final AccountServices accountServices;
    private static final Logger logger = LoggerFactory.getLogger(AuthController.class);

    public AuthController(AccountServices accountServices) {
        this.accountServices = accountServices;
    }


    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@RequestBody Map<String, String> request,
                                                     HttpServletRequest httpRequest) {

        logger.debug("Login endpoint called with payload: {}", request);

        Map<String, Object> response = new HashMap<>();
        try {
            String email = request.get("email");
            String password = request.get("password");

            // Log attempt
            logger.info("Attempting login for email: {}", email);

            Account account = accountServices.checkLogin(email, password);

            if (account != null && account.isStatus()) {
                HttpSession session = httpRequest.getSession(true);
                session.setAttribute("account_id", account.getId());

                response.put("success", true);
                response.put("message", "Đăng nhập thành công");
                response.put("user", createUserDetailsMap(account));

                // Log success
                logger.info("Login successful for email: {} (id={})", email, account.getId());
                return ResponseEntity.ok(response);
            } else {
                // Wrong credentials or locked account
                String msg = "Email/Password incorrect or account locked.";
                response.put("success", false);
                response.put("message", msg);

                logger.warn(msg + " Email: {}", email);
                return ResponseEntity.status(401).body(response);
            }
        } catch (Exception e) {
            // Log exception with stack trace
            logger.error("Login failed for email {}: {}", request.get("email"), e.toString(), e);
            throw new RuntimeException("Failed to get account with error: " + e.getMessage());
        }
    }


    @GetMapping("/auth/status")
    public ResponseEntity<Map<String, Object>> getAuthStatus(HttpSession session) {
        Map<String, Object> response = new HashMap<>();

        // Log request start
        logger.debug("Auth status requested for session id: {}", session.getId());

        try {
            Long accountId = (Long) session.getAttribute("account_id");
            if (accountId != null) {
                Account account = accountServices.findById(accountId);
                if (account != null && account.isStatus()) {
                    response.put("isAuthenticated", true);
                    response.put("user", createUserDetailsMap(account));

                    // Log authenticated user
                    logger.info("Auth status: User authenticated. Account id={}", accountId);
                } else {
                    // Account not found or inactive
                    response.put("isAuthenticated", false);
                    session.invalidate();
                    logger.warn("Auth status: Invalid or inactive account (id={}). Session invalidated.", accountId);
                }
            } else {
                response.put("isAuthenticated", false);
                logger.info("Auth status: No account_id in session. User not authenticated.");
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            logger.error("Error while retrieving auth status: {}", e.toString(), e);
            throw new RuntimeException("Failed to getAuthStatus: " + e.getMessage());
        }
    }


    @PostMapping("/logout")
    public ResponseEntity<Map<String, Object>> logout(HttpServletRequest request) {
        Map<String, Object> response = new HashMap<>();

        // Log logout attempt
        logger.info("Logout requested.");

        HttpSession session = request.getSession(false);
        if (session != null) {
            session.invalidate();
            response.put("success", true);
            response.put("message", "Đăng xuất thành công");

            logger.info("Session {} invalidated successfully.", session.getId());
        } else {
            // No active session
            response.put("success", false);
            response.put("message", "Không có phiên làm việc nào để đăng xuất.");

            logger.warn("Logout attempted but no active session found.");
        }

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
