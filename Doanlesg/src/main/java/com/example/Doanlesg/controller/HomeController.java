package com.example.Doanlesg.controller;

import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.repository.AccountRepository;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/home")
public class HomeController {

    private final AccountRepository accountRepository;

    public HomeController(AccountRepository accountRepository) {
        this.accountRepository = accountRepository;
    }

    @GetMapping("/home")
    public String homePage(@ModelAttribute UserDetails userDetails, Model model) {
        String email = userDetails.getUsername();

        Account account = accountRepository.findByEmail(email).orElse(null);

        if (account != null) {
            String welcomeName = "";
            if (account.getCustomer() != null) {
                welcomeName = account.getCustomer().getFullName();
            } else if (account.getStaff() != null) {
                welcomeName = account.getStaff().getFullName();
            } else if (account.getAdmin() != null) {
                welcomeName = account.getAdmin().getFullName();
            }
            model.addAttribute("welcomeName", welcomeName);
        }

        return "home";
    }
}