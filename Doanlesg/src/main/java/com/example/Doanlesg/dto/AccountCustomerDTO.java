package com.example.Doanlesg.dto;

import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.model.Customer;

public class AccountCustomerDTO {
    private Account account;
    private Customer customer;
    private String email;
    private String password;
    private String fullName;
    private String phoneNumber;

    // Getters and setters
    public Account getAccount() { return account; }
    public void setAccount(Account account) { this.account = account; }
    public Customer getCustomer() { return customer; }
    public void setCustomer(Customer customer) { this.customer = customer; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }

}

