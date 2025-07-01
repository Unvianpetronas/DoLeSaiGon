package com.example.Doanlesg.services;

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

            // Create default Customer if null
            if(customerDetail == null){
                customerDetail = new Customer();
                // Set default customer properties if needed
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

            // Create default Staff if null
            if(staffDetail == null){
                staffDetail = new Staff();
                // Set default staff properties if needed
            }

            accountDetail.setStaff(staffDetail);
            staffDetail.setAccount(accountDetail);
            return accountRepository.save(accountDetail);
        }
        return null;
    }

    @Transactional
    public boolean updateCustomerAccount(Long accountId, Account accountUpdate, Customer customerUpdate) {
        // Find the existing account
        Account existingAccount = accountRepository.findById(accountId).orElse(null);

        if (existingAccount == null) {
            return false; // Account not found
        }

        // Verify this is actually a customer account
        Customer existingCustomer = existingAccount.getCustomer();
        if (existingCustomer == null) {
            return false; // Not a customer account
        }

        try {
            // Update Account fields if provided
            if (accountUpdate != null) {
                // Update email if provided and valid
                if (accountUpdate.getEmail() != null && !accountUpdate.getEmail().trim().isEmpty()) {
                    if (!checkEmail(accountId, accountUpdate.getEmail())) {
                        return false; // Email validation failed
                    }
                    existingAccount.setEmail(accountUpdate.getEmail().trim());
                }

                // Update password if provided
                if (accountUpdate.getPasswordHash() != null && !accountUpdate.getPasswordHash().trim().isEmpty()) {
                    String encodedPassword = passwordEncoder.encode(accountUpdate.getPasswordHash());
                    existingAccount.setPasswordHash(encodedPassword);
                }
            }

            // Update Customer fields if provided
            if (customerUpdate != null) {
                if (customerUpdate.getFullName() != null && !customerUpdate.getFullName().trim().isEmpty()) {
                    existingCustomer.setFullName(customerUpdate.getFullName().trim());
                }

                if (customerUpdate.getPhoneNumber() != null && !customerUpdate.getPhoneNumber().trim().isEmpty()) {
                    existingCustomer.setPhoneNumber(customerUpdate.getPhoneNumber().trim());
                }
            }

            // Save the updated account (cascades to customer)
            accountRepository.save(existingAccount);
            return true;

        } catch (Exception e) {
            throw new RuntimeException("Failed to update customer account: " + e.getMessage(), e);
        }
    }

    @Transactional
    public boolean updateStaffAccount(Long accountId, Account accountUpdate, Staff staffUpdate) {
        // Find the existing account
        Account existingAccount = accountRepository.findById(accountId).orElse(null);

        if (existingAccount == null) {
            return false; // Account not found
        }

        // Verify this is actually a staff account
        Staff existingStaff = existingAccount.getStaff();
        if (existingStaff == null) {
            return false; // Not a staff account
        }

        try {
            // Update Account fields if provided
            if (accountUpdate != null) {
                // Update email if provided and valid
                if (accountUpdate.getEmail() != null && !accountUpdate.getEmail().trim().isEmpty()) {
                    if (!checkEmail(accountId, accountUpdate.getEmail())) {
                        return false; // Email validation failed
                    }
                    existingAccount.setEmail(accountUpdate.getEmail().trim());
                }

                // Update password if provided
                if (accountUpdate.getPasswordHash() != null && !accountUpdate.getPasswordHash().trim().isEmpty()) {
                    String encodedPassword = passwordEncoder.encode(accountUpdate.getPasswordHash());
                    existingAccount.setPasswordHash(encodedPassword);
                }
            }

            // Update Staff fields if provided
            if (staffUpdate != null) {
                if (staffUpdate.getFullName() != null && !staffUpdate.getFullName().trim().isEmpty()) {
                    existingStaff.setFullName(staffUpdate.getFullName().trim());
                }

                if (staffUpdate.getPhoneNumber() != null && !staffUpdate.getPhoneNumber().trim().isEmpty()) {
                    existingStaff.setPhoneNumber(staffUpdate.getPhoneNumber().trim());
                }

                if (staffUpdate.getEmployeeId() != null && !staffUpdate.getEmployeeId().trim().isEmpty()) {
                    existingStaff.setEmployeeId(staffUpdate.getEmployeeId().trim());
                }

                if (staffUpdate.getDepartment() != null && !staffUpdate.getDepartment().trim().isEmpty()) {
                    existingStaff.setDepartment(staffUpdate.getDepartment().trim());
                }
            }

            // Save the updated account (cascades to staff)
            accountRepository.save(existingAccount);
            return true;

        } catch (Exception e) {
            throw new RuntimeException("Failed to update staff account: " + e.getMessage(), e);
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
        return !accountRepository.existsByEmail(email);
    }


    /*public boolean checkEmail(long id, String email){
        Account existingAccount = accountRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Account not found with id: "));
        // This returns false if the email is unchanged OR if it's taken by another user.
        return !existingAccount.getEmail().equals(email) && !accountRepository.existsByEmail(email);
    }*/

    public boolean checkEmail(long id, String email){
        Account existingAccount = accountRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Account not found with id: " + id));

        // If email is unchanged, it's valid (allow keeping the same email)
        if (existingAccount.getEmail().equals(email)) {
            return true;
        }

        // If email is different, check if it's already taken by another account
        return !accountRepository.existsByEmail(email);
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

    /**
     * Retrieves all accounts from the database.
     * @return List of all Account objects.
     */
    public List<Account> getAllAccounts() {
        return accountRepository.findAll();
    }
}