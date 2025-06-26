package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.ApiResponse;
import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.repository.AccountRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Optional;

@RestController
@RequestMapping("api/ver0.0.1/home")
public class HomeController {

    private final AccountRepository accountRepository;

    public HomeController(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @GetMapping
    public ResponseEntity<ApiResponse> showHomePage(@AuthenticationPrincipal UserDetails userDetails) {
        if (userDetails == null) {
            return ResponseEntity.ok(new ApiResponse(false, "chưa đăng nhập, hãy quay lại trang đăng nhập"));
        }
        String email = userDetails.getUsername();
        Optional<Account> account = accountRepository.findByEmail(email);

        if (account.isPresent()) {
            String welcomeName = "User";
            if (account.get().getCustomer() != null && account.get().getCustomer().getFullName() != null) {
                welcomeName = account.get().getCustomer().getFullName();
            } else if (account.get().getStaff() != null && account.get().getStaff().getFullName() != null) {
                welcomeName = account.get().getStaff().getFullName();
            } else if (account.get().getAdmin() != null && account.get().getAdmin().getFullName() != null) {
                welcomeName = account.get().getAdmin().getFullName();
            }
            return ResponseEntity.ok(new ApiResponse(true, welcomeName));
        }
        return ResponseEntity.notFound().build();
    }
}