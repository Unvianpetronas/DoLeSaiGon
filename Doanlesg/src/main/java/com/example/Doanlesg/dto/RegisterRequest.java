package com.example.Doanlesg.dto;

public class RegisterRequest {
    private String fullName;
    private String email;
    private String password;
    private String phoneNumber;

    // Bắt buộc phải có Getters và Setters để Spring gán giá trị
    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPassword() { return password; }
    public void setPassword(String password) { this.password = password; }
    public String getPhoneNumber() { return phoneNumber; }
    public void setPhoneNumber(String phoneNumber) { this.phoneNumber = phoneNumber; }
}