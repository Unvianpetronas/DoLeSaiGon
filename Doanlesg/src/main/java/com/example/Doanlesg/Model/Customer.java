package com.example.Doanlesg.Model;

import jakarta.persistence.*;
import java.util.Date;
import java.util.List;

@Entity
@Table(name = "KhachHang") // Ánh xạ tới bảng KhachHang
public class Customer {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Phù hợp với IDENTITY(1,1) của SQL Server
    @Column(name = "customer_id") // Ánh xạ tới cột customer_id
    private Long id; // Hoặc Long nếu bạn muốn

    @Column(name = "full_name", nullable = false, length = 100)
    private String fullName;

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash; // Luôn mã hóa mật khẩu

    @Column(name = "phone_number", length = 20)
    private String phoneNumber;

    @Column(name = "created_at", updatable = false) // updatable = false vì DB tự quản lý qua DEFAULT GETDATE()
    @Temporal(TemporalType.TIMESTAMP) // Hoặc dùng java.time.LocalDateTime với Hibernate phiên bản mới
    private java.util.Date createdAt;


    @Column(name = "status", columnDefinition = "1")
    private boolean status;


    // Mối quan hệ một khách hàng có nhiều địa chỉ
    @OneToMany(mappedBy = "customer", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    // mappedBy = "customer": trỏ tới thuộc tính 'customer' trong entity Address
    // cascade = CascadeType.ALL: các thao tác (persist, merge, remove) trên Customer sẽ áp dụng cho Address liên quan
    // orphanRemoval = true: nếu một Address bị xóa khỏi danh sách addresses của Customer, nó cũng sẽ bị xóa khỏi DB
    // fetch = FetchType.LAZY: chỉ tải danh sách địa chỉ khi thực sự cần đến
    private List<Address> addresses;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "role_id",nullable = false)
    private Role role;

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }


    public Customer() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public void setPasswordHash(String passwordHash) {
        this.passwordHash = passwordHash;
    }

    public String getPhoneNumber() {
        return phoneNumber;
    }

    public void setPhoneNumber(String phoneNumber) {
        this.phoneNumber = phoneNumber;
    }


    public List<Address> getAddresses() {
        return addresses;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public void setAddresses(List<Address> addresses) {
        this.addresses = addresses;
    }
    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }
}