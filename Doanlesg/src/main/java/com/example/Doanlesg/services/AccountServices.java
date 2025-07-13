package com.example.Doanlesg.services;

import com.example.Doanlesg.dto.AccountDisplayDTO;
import com.example.Doanlesg.interal.PasswordEncoder;
import com.example.Doanlesg.model.*;
import com.example.Doanlesg.repository.AccountRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class AccountServices /* REMOVE: implements UserDetailsService */ {
    private final AccountRepository accountRepository;
    private final PasswordEncoder passwordEncoder;

    @Autowired
    public AccountServices(AccountRepository accountRepository, PasswordEncoder passwordEncoder) {
        this.accountRepository = accountRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public Account createCustomerAccount(Account accountDetail, Customer customerDetail) {
        if(validateNewAccount(accountDetail.getEmail())){
            String encodedPassword = passwordEncoder.encode(accountDetail.getPasswordHash());
            accountDetail.setPasswordHash(encodedPassword);
            accountDetail.setStatus(true);
            accountDetail.setCreatedAt(LocalDateTime.now());
            if(customerDetail == null){
                throw new IllegalArgumentException("Customer cannot be null");
            }
            accountDetail.setCustomer(customerDetail);
            customerDetail.setAccount(accountDetail);
            if(accountDetail.getCart() == null) {
                Cart cart = new Cart();
                cart.setAccount(accountDetail);
                accountDetail.setCart(cart);
            }
            return accountRepository.save(accountDetail);
        }
        return null;
    }

    // ... (other methods like createStaffAccount, updateCustomerAccount, etc. remain the same)
    @Transactional
    public Account createStaffAccount(Account accountDetail, Staff staffDetail) {
        if(validateNewAccount(accountDetail.getEmail())){
            String encodedPassword = passwordEncoder.encode(accountDetail.getPasswordHash());
            accountDetail.setPasswordHash(encodedPassword);
            accountDetail.setStatus(true);
            accountDetail.setCreatedAt(LocalDateTime.now());
            if(staffDetail == null){
                throw new IllegalArgumentException("staffDetail cannot be null");
            }
            accountDetail.setStaff(staffDetail);
            staffDetail.setAccount(accountDetail);
            return accountRepository.save(accountDetail);
        }
        return null;
    }

    @Transactional
    public boolean updateCustomerAccount(Long id , Account accountUpdateDetail, Customer customerUpdateDetail) {
        Account existAccount = accountRepository.existsById(id) ? accountRepository.findById(id).get() : null;
        assert existAccount != null;
        Customer customerOld = existAccount.getCustomer();
        try{
            if(customerOld == null){
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
    @Transactional
    public boolean updateStaffAccount(Long id , Account accountUpdateDetail, Staff staffUpdateDetail) {
        Account existAccount = accountRepository.existsById(id) ? accountRepository.findById(id).get() : null;
        assert existAccount != null;
        Customer customerOld = existAccount.getCustomer();
        try{
            if(customerOld == null){
                return false;
            } else if (checkEmail(accountUpdateDetail.getId(),accountUpdateDetail.getEmail())) {
                existAccount.setEmail(accountUpdateDetail.getEmail());
                existAccount.setStaff(staffUpdateDetail);
                accountRepository.save(existAccount);

            }
            return true;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }
    @Transactional
    public boolean deleteAccount(Account accountDetail) {
        if(accountRepository.existsById(accountDetail.getId())){
            accountRepository.delete(accountDetail);
            return true;
        }else{
            return false;
        }
    }

    public boolean validateNewAccount(String email){
        return accountRepository.existsByEmail(email);
    }


    public boolean checkEmail(long id, String email){
        Account existingAccount = accountRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Account not found with id: "));
        // This returns false if the email is unchanged OR if it's taken by another user.
        return !existingAccount.getEmail().equals(email) && accountRepository.existsByEmail(email);
    }

    /**
     * Checks if the provided email and password are valid.
     * Returns the Account object on success, or null on failure.
     */
    public Account checkLogin(String email, String password){
        // Find the account by email
        Account account = accountRepository.findByEmail(email).orElse(null);

        // If account exists and password matches, return the account
        if(account != null && passwordEncoder.matches(password, account.getPasswordHash())){
            return account;
        }
        // Otherwise, return null
        return null;
    }

    /**
     * Finds an account by its ID.
     * @param id The ID of the account.
     * @return The Account object or null if not found.
     */
    public Account findById(Long id) {
        return accountRepository.findById(id).orElse(null);
    }

    @Transactional // Use readOnly for performance
    public List<AccountDisplayDTO> getAllAccountsAsDTO() {
        return accountRepository.findAll()
                .stream()
                .map(AccountDisplayDTO::fromEntity) // Convert each Account to a DTO
                .toList();
    }
}