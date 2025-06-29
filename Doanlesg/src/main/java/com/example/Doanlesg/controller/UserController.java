package com.example.Doanlesg.controller;

import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.services.AccountServices;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// REMOVE: Spring Security import
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    private final AccountServices accountServices;

    public UserController(AccountServices accountServices) {
        this.accountServices = accountServices;
    }

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(HttpSession session) {
        Long accountId = (Long) session.getAttribute("account_id");
        if (accountId == null) {
            return new ResponseEntity<>("No user authenticated", HttpStatus.UNAUTHORIZED);
        }

        Account account = accountServices.findById(accountId);
        if (account == null) {
            return new ResponseEntity<>("User not found", HttpStatus.NOT_FOUND);
        }

        // Assuming a logged-in user is a customer for this endpoint's purpose
        if (account.getCustomer() == null) {
            return new ResponseEntity<>("User is not a customer", HttpStatus.FORBIDDEN);
        }

        Map<String, Object> userData = new HashMap<>();
        userData.put("id", account.getId());
        userData.put("name", account.getCustomer().getFullName());
        userData.put("email", account.getEmail());

        return ResponseEntity.ok(userData);
    }
}