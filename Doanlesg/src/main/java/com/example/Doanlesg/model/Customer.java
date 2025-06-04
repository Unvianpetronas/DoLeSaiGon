package com.example.Doanlesg.model;

import jakarta.persistence.*;

@Entity
@Table(name = "customer")
public class Customer {
    @OneToOne
    @JoinColumn(name = "account_id",nullable = false)
    private Account account;

    @Column(name = "full_name",nullable = false)
    private String fullName;

    @Column(name = "phone_number",nullable = false)
    private String phoneNumber;

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }
}
