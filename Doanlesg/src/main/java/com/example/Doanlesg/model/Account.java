package com.example.Doanlesg.model;

import com.fasterxml.jackson.annotation.JsonManagedReference;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "account")
@Getter
@Setter
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
    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL)
    @JsonManagedReference("account-admin")
    private Admin admin;

    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL)
    @JsonManagedReference("account-staff")
    private Staff staff;

    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL)
    @JsonManagedReference("account-customer")
    private Customer customer;

    @OneToOne(mappedBy = "account", cascade = CascadeType.ALL)
    @JsonManagedReference("account-cart")
    private Cart cart;

    @OneToMany(mappedBy = "account", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    @JsonManagedReference("account-orders")
    private List<Order> order;

    @Transient
    public String getFullName() {
        if (this.customer != null) {
            return this.customer.getFullName();
        }
        if (this.admin != null) {
            return this.admin.getFullName();
        }
        if (this.staff != null) {
            return this.staff.getFullName();
        }
        return "";
    }

    /**
     * Business logic method to get the phone number from the correct related entity.
     */
    @Transient
    public String getPhoneNumber() {
        if (this.customer != null) {
            return this.customer.getPhoneNumber();
        }
        if (this.staff != null) {
            return this.staff.getPhoneNumber();
        }
        if (this.admin != null) {
            return this.admin.getPhoneNumber();
        }
        return ""; // Return empty string instead of null
    }
}