package com.example.Doanlesg.services;

import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.model.Address;
import com.example.Doanlesg.model.Customer;
import com.example.Doanlesg.repository.AccountRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.ArrayList;

@Service
public class AccountServices {
    private AccountRepository accountRepository;
    private PasswordEncoder passwordEncoder;

    @Autowired
    public AccountServices(AccountRepository accountRepository,PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }
    public Account createAccount(Account account) {
        account.setPasswordHash(passwordEncoder.encode(account.getPasswordHash()));
        if(account.getAddresses() != null && account.getAddresses().size() > 0) {
            for(Address address : account.getAddresses()) {
                address.setAccount(account);
            }
        }else {
            account.setAddresses(new ArrayList<>());
        }
        return accountRepository.save(account);
    }



}

