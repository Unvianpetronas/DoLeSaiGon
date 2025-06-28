package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.ApiResponse;
import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.services.AccountServices; // Use the service
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
// REMOVE: Spring Security imports
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("api/ver0.0.1/home")
public class HomeController {

    private final AccountServices accountServices;

    public HomeController(AccountServices accountServices) {
        this.accountServices = accountServices;
    }

    @GetMapping
    public ResponseEntity<ApiResponse> showHomePage(HttpSession session) {
        Long accountId = (Long) session.getAttribute("account_id");
        if (accountId == null) {
            return ResponseEntity.ok(new ApiResponse(false, "chưa đăng nhập, hãy quay lại trang đăng nhập"));
        }

        Account account = accountServices.findById(accountId);

        if (account != null) {
            String welcomeName = "User"; // Default name
            if (account.getCustomer() != null && account.getCustomer().getFullName() != null) {
                welcomeName = account.getCustomer().getFullName();
            } else if (account.getStaff() != null && account.getStaff().getFullName() != null) {
                welcomeName = account.getStaff().getFullName();
            } else if (account.getAdmin() != null && account.getAdmin().getFullName() != null) {
                welcomeName = account.getAdmin().getFullName();
            }
            return ResponseEntity.ok(new ApiResponse(true, "Chào mừng " + welcomeName));
        }
        return ResponseEntity.notFound().build();
    }
}