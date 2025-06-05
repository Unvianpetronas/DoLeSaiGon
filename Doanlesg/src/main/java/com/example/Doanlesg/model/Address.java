package com.example.Doanlesg.model;

import jakarta.persistence.*;

@Entity
@Table(name = "address") // Ánh xạ tới bảng DiaChi
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "address_id")
    private Long id;

    // Mối quan hệ nhiều địa chỉ thuộc về một account
    @ManyToOne(fetch = FetchType.LAZY) // fetch = FetchType.LAZY: chỉ tải Customer khi cần
    @JoinColumn(name = "account_id", nullable = false) // Cột khóa ngoại trong bảng DiaChi
    private Account account;

    @Column(name = "street_address", nullable = true, length = 255)
    private String streetAddress;

    @Column(name = "is_default", nullable = false)
    private boolean isDefault;



    public Address() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Account getAccount() {
        return account;
    }

    public void setAccount(Account account) {
        this.account = account;
    }

    public String getStreetAddress() {
        return streetAddress;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }

    public void setStreetAddress(String streetAddress) {
        this.streetAddress = streetAddress;
    }
}