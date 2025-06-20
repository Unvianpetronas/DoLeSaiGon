package com.example.Doanlesg.services;

import com.example.Doanlesg.model.*;
import com.example.Doanlesg.repository.AccountRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.time.LocalDateTime;

@Service
public class AccountServices implements UserDetailsService /* User Detail la phong quan li nhan su dung trong spring security*/ {
    private AccountRepository accountRepository;
    private PasswordEncoder passwordEncoder;


    @Autowired
    public AccountServices(AccountRepository accountRepository,PasswordEncoder passwordEncoder ) {
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
           accountDetail.setAddresses(new ArrayList<>());
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

    @Transactional
    public Account createStaffAccount(Account accountDetail, Staff staffDetail) {
        if(validateNewAccount(accountDetail.getEmail())){
            String encodedPassword = passwordEncoder.encode(accountDetail.getPasswordHash());
            accountDetail.setPasswordHash(encodedPassword);
            accountDetail.setStatus(true);
            accountDetail.setCreatedAt(LocalDateTime.now());
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
    
    @Transactional
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
    @Transactional
    public boolean updateStaffAccount(Long id , Account accountUpdateDetail, Staff staffUpdateDetail) {
        Account existAccount = accountRepository.existsById(id) ? accountRepository.findById(id).get() : null;
        Customer customerOld = existAccount.getCustomer();
        try{
            if(existAccount == null || customerOld == null){
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
        if(accountRepository.existsByEmail(email)){
            return false;
        }
            return true;
    }


    public boolean checkEmail(long id, String email){
        Account existingAccount = accountRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Account not found with id: "));
        // This returns false if the email is unchanged OR if it's taken by another user.
        if(existingAccount.getEmail().equals(email)||accountRepository.existsByEmail(email)){
            return false;
        }
        return true;
    }
    public Account checkLogin(String email, String password){
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new EntityNotFoundException("Account not found"));
        if(passwordEncoder.matches(password, account.getPasswordHash())){
            return account;
        }else {
            return null;
        }
    } // neu xai userDetail cua spring thi khong can dung thang nay

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Account account = accountRepository.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Not found account with email: " + email));

        if (!account.isStatus()) {
            throw new UsernameNotFoundException("Tài khoản đã bị vô hiệu hóa: " + email);
        }
        List<GrantedAuthority> authorities = new ArrayList<>();   // dai dien cho cac vai tro chuc vu trong UserDetailService

        if (account.getCustomer() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_CUSTOMER"));
        } else if (account.getStaff() != null) {
            Staff staff = account.getStaff();
            if ("MANAGER".equalsIgnoreCase(staff.getEmployeeId())) {
                authorities.add(new SimpleGrantedAuthority("ROLE_MANAGER"));
            } else {
                authorities.add(new SimpleGrantedAuthority("ROLE_STAFF"));
            }
        } else if (account.getAdmin() != null) {
            authorities.add(new SimpleGrantedAuthority("ROLE_ADMIN"));

        }
        if (authorities.isEmpty()) {
            throw new UsernameNotFoundException("Tài khoản " + email + " không được gán vai trò hợp lệ (Customer/Staff/Admin).");
        }

        return new org.springframework.security.core.userdetails.User(
                account.getEmail(),
                account.getPasswordHash(),
                account.isStatus(), // enabled
                true, // accountNonExpired
                true, // credentialsNonExpired
                true, // accountNonLocked
                authorities // Danh sách vai trò
        );
    }
}

