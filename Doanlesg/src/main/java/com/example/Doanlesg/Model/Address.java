package com.example.Doanlesg.Model;

import jakarta.persistence.*;

@Entity
@Table(name = "DiaChi") // Ánh xạ tới bảng DiaChi
public class Address {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "address_id")
    private Integer id;

    // Mối quan hệ nhiều địa chỉ thuộc về một khách hàng
    @ManyToOne(fetch = FetchType.LAZY) // fetch = FetchType.LAZY: chỉ tải Customer khi cần
    @JoinColumn(name = "customer_id", nullable = false) // Cột khóa ngoại trong bảng DiaChi
    private Customer customer;

    @Column(name = "address_line", nullable = false, length = 255)
    private String addressLine;

    @Column(name = "city", nullable = false, length = 100)
    private String city;

    @Column(name = "state_province", nullable = false, length = 100)
    private String stateProvince;

    @Column(name = "postal_code", length = 20)
    private String postalCode;

    @Column(name = "country", nullable = false, length = 50)
    private String country;

    @Column(name = "is_default", columnDefinition = "BIT DEFAULT 0")
    private boolean isDefault;

    // Constructors, Getters, and Setters

    public Address() {
    }

    // Getters and Setters cho tất cả các trường

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public String getAddressLine() {
        return addressLine;
    }

    public void setAddressLine(String addressLine) {
        this.addressLine = addressLine;
    }

    public String getCity() {
        return city;
    }

    public void setCity(String city) {
        this.city = city;
    }

    public String getStateProvince() {
        return stateProvince;
    }

    public void setStateProvince(String stateProvince) {
        this.stateProvince = stateProvince;
    }

    public String getPostalCode() {
        return postalCode;
    }

    public void setPostalCode(String postalCode) {
        this.postalCode = postalCode;
    }

    public String getCountry() {
        return country;
    }

    public void setCountry(String country) {
        this.country = country;
    }

    public boolean isDefault() {
        return isDefault;
    }

    public void setDefault(boolean aDefault) {
        isDefault = aDefault;
    }
}