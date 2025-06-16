package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.ApiResponse;
import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.repository.AccountRepository;
import org.apache.coyote.Response;
import org.hibernate.query.NativeQuery;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/home")
public class HomeController {

    private final AccountRepository accountRepository;

    public HomeController(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @GetMapping("/home")
    public ResponseEntity<ApiResponse> showHomePage(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.ok(new ApiResponse(false, "chưa đăng nhập, hãy quay lại trang đăng nhập"));
        }
        String email = userDetails.getUsername();
        Account account = accountRepository.findByEmail(email).orElse(null);

        if (account != null) {
            String welcomeName = "User";
            if (account.getCustomer() != null && account.getCustomer().getFullName() != null) {
                welcomeName = account.getCustomer().getFullName();
            } else if (account.getStaff() != null && account.getStaff().getFullName() != null) {
                welcomeName = account.getStaff().getFullName();
            } else if (account.getAdmin() != null && account.getAdmin().getFullName() != null) {
                welcomeName = account.getAdmin().getFullName();
            }
            return ResponseEntity.ok(new ApiResponse(true, welcomeName));
        }
        return ResponseEntity.notFound().build();
    }
}