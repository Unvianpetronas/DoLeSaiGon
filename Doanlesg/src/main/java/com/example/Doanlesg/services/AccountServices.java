package com.example.Doanlesg.services;

import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.model.Address;
import com.example.Doanlesg.model.Customer;
import com.example.Doanlesg.model.Staff;
import com.example.Doanlesg.repository.AccountRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.Date;

@Service
public class AccountServices {
    private AccountRepository accountRepository;
    private PasswordEncoder passwordEncoder;


    @Autowired
    public AccountServices(AccountRepository accountRepository,PasswordEncoder passwordEncoder ) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }
    public Account createCustomerAccount(Account accountDetail, Customer customerDetail) {
       if(validateNewAccount(accountDetail.getEmail())){
           String encodedPassword = passwordEncoder.encode(accountDetail.getPasswordHash());
           accountDetail.setPasswordHash(encodedPassword);
           accountDetail.setStatus(true);
           accountDetail.setCreatedAt(new Date());
           if(accountDetail.getAddresses().size() > 0 && !accountDetail.getAddresses().isEmpty()){
               for(Address address : accountDetail.getAddresses()){
                  address.setAccount(accountDetail);
               }
           }else{
               accountDetail.setAddresses(new ArrayList<>());
           }
           if(customerDetail == null){
               throw new IllegalArgumentException("Customer cannot be null");
           }
           accountDetail.setCustomer(customerDetail);
           customerDetail.setAccount(accountDetail);
           return accountRepository.save(accountDetail);
       }
       return null;
    }


    public Account createStaffAccount(Account accountDetail, Staff staffDetail) {
        if(validateNewAccount(accountDetail.getEmail())){
            String encodedPassword = passwordEncoder.encode(accountDetail.getPasswordHash());
            accountDetail.setPasswordHash(encodedPassword);
            accountDetail.setStatus(true);
            accountDetail.setCreatedAt(new Date());
            if(accountDetail.getAddresses().size() > 0 && !accountDetail.getAddresses().isEmpty()){
                for(Address address : accountDetail.getAddresses()){
                    address.setAccount(accountDetail);
                }
            }else{
                accountDetail.setAddresses(new ArrayList<>());
            }
            if(staffDetail == null){
                throw new IllegalArgumentException("staffDetail cannot be null");
            }
            accountDetail.setStaff(staffDetail);
            staffDetail.setAccount(accountDetail);
            return accountRepository.save(accountDetail);
        }
        return null;
    }
    
    
    public boolean updateCustomerAccount(Long id , Account accountUpdateDetail, Customer customerUpdateDetail) {
        Account existAccount = accountRepository.existsById(id) ? accountRepository.findById(id).get() : null;
        Customer customerOld = existAccount.getCustomer();
        try{
            if(existAccount == null || customerOld == null){
                return false;
            } else if (checkEmail(accountUpdateDetail.getId(),accountUpdateDetail.getEmail())) {
                existAccount.setEmail(accountUpdateDetail.getEmail());
                existAccount.setCustomer(customerUpdateDetail);
                accountRepository.save(existAccount);

            }
            return true;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    public boolean deleteAccount(Account accountDetail) {
        if(accountRepository.existsById(accountDetail.getId())){
            accountRepository.delete(accountDetail);
            return true;
        }else{
            return false;
        }
    }


    private boolean validateNewAccount(String email){
        if(accountRepository.existsByEmail(email)){
            return false;
        }
            return true;
    }


    public boolean checkEmail(long id, String email){
        Account existingAccount = accountRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Account not found with id: "));
        if(existingAccount.getEmail().equals(email)||accountRepository.existsByEmail(email)){
            return false;
            }
        return true;
    }
    public boolean checkLogin(String email, String password){
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Account not found"));
        if(passwordEncoder.matches(password, account.getPasswordHash())){
            return true; // Passwords match
        }else {
            return false;
        }
    }


    
}

