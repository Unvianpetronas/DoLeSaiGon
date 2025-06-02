package com.example.Doanlesg.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "address") // Ánh xạ tới bảng DiaChi
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "address_id")
    private Long id;

    // Mối quan hệ nhiều địa chỉ thuộc về một khách hàng
    @ManyToOne(fetch = FetchType.LAZY) // fetch = FetchType.LAZY: chỉ tải Customer khi cần
    @JoinColumn(name = "customer_id", nullable = false) // Cột khóa ngoại trong bảng DiaChi
    private User customer;

    @Column(name = "street_address", nullable = false, length = 255)
    private String streetAddress;



    public Address() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public User getCustomer() {
        return customer;
    }

    public void setCustomer(User customer) {
        this.customer = customer;
    }

    public String getStreetAddress() {
        return streetAddress;
    }

    public void setStreetAddress(String streetAddress) {
        this.streetAddress = streetAddress;
    }
}