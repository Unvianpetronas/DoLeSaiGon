package com.example.Doanlesg.controller;

import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.services.AccountServices;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RestController;



@RestController("/LoginController")

public class LoginController {

    private AccountServices accountServices;


    public LoginController(AccountServices accountServices) {
        this.accountServices = accountServices;
    }


    @PostMapping("/login")
    public String Login() {
        return "login";
    }

}
