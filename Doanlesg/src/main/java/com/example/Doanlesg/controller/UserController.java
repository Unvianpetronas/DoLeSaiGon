package com.example.Doanlesg.controller;

import com.example.Doanlesg.model.Account;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class UserController {

    @GetMapping("/user")
    public ResponseEntity<?> getCurrentUser(@AuthenticationPrincipal Account account) {
        if (account == null) {
            // Nếu không có ai đăng nhập, trả về lỗi 401
            return new ResponseEntity<>("No user authenticated", HttpStatus.UNAUTHORIZED);
        }

        // Nếu đã đăng nhập, trả về thông tin cơ bản của người dùng
        Map<String, Object> userData = new HashMap<>();
        userData.put("id", account.getId());
        userData.put("name", account.getCustomer().getFullName());
        userData.put("email", account.getEmail());

        return ResponseEntity.ok(userData);
    }
}