package com.example.Doanlesg.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "account") // Ánh xạ tới bảng account
public class Account {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY) // Phù hợp với IDENTITY(1,1) của SQL Server
    @Column(name = "account_id") // Ánh xạ tới cột account_id
    private Long id; // Hoặc Long nếu bạn muốn

    @Column(name = "password_hash", nullable = false, length = 255)
    private String passwordHash; // Luôn mã hóa mật khẩu

    @Column(name = "email", nullable = false, unique = true, length = 100)
    private String email;

    //@ManyToOne(fetch = FetchType.LAZY)
    //@JoinColumn(name = "role_id",nullable = false)
    //private Role role;

    @Column(name = "created_at", updatable = false) // updatable = false vì DB tự quản lý qua DEFAULT GETDATE()
    @Temporal(TemporalType.TIMESTAMP) // Hoặc dùng java.time.LocalDateTime với Hibernate phiên bản mới
    private LocalDateTime createdAt;


    @Column(name = "status", columnDefinition = "1")
    private boolean status;


    // Mối quan hệ một khách hàng có nhiều địa chỉ
    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY, optional = true)
    // mappedBy = "user": trỏ tới thuộc tính 'customer' trong entity Address
    // cascade = CascadeType.ALL: các thao tác (persist, merge, remove) trên Customer sẽ áp dụng cho Address liên quan
    // orphanRemoval = true: nếu một Address bị xóa khỏi danh sách addresses của Customer, nó cũng sẽ bị xóa khỏi DB
    // fetch = FetchType.LAZY: chỉ tải danh sách địa chỉ khi thực sự cần đến
    private Admin admin;

    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY, optional = true)
    private Staff staff;

    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY, optional = true)
    private Customer customer;

    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY, optional = true)
    private Cart cart;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    // mappedBy = "user": trỏ tới thuộc tính 'customer' trong entity Address
    // cascade = CascadeType.ALL: các thao tác (persist, merge, remove) trên Customer sẽ áp dụng cho Address liên quan
    // orphanRemoval = true: nếu một Address bị xóa khỏi danh sách addresses của Customer, nó cũng sẽ bị xóa khỏi DB
    // fetch = FetchType.LAZY: chỉ tải danh sách địa chỉ khi thực sự cần đến
    private List<Order> order;

    public Account() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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



    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }


    public Admin getAdmin() {
        return admin;
    }

    public void setAdmin(Admin admin) {
        this.admin = admin;
    }

    public Staff getStaff() {
        return staff;
    }

    public void setStaff(Staff staff) {
        this.staff = staff;
    }

    public Customer getCustomer() {
        return customer;
    }

    public void setCustomer(Customer customer) {
        this.customer = customer;
    }

    public Cart getCart() {
        return cart;
    }

    public void setCart(Cart cart) {
        this.cart = cart;
    }

    public List<Order> getOrder() {
        return order;
    }

    public void setOrder(List<Order> order) {
        this.order = order;
    }
}