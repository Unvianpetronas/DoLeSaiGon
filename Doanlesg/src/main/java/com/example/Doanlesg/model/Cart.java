package com.example.Doanlesg.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "cart")
public class Cart {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "cart_id", nullable = false)
    private Long id;

    @OneToOne
    @JoinColumn(name = "account_id")
    private Account account;

    // Các trường từ YAML
    @Column(name = "created_at", updatable = false, insertable = false)
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime createdAt;

    @Column(name = "updated_at", updatable = false, insertable = false)
    // Hoặc dùng @UpdateTimestamp của Hibernate
    @Temporal(TemporalType.TIMESTAMP)
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.LAZY)
    // mappedBy = "cart": trỏ tới thuộc tính 'cart' trong entity cart Item
    // cascade = CascadeType.ALL: các thao tác (persist, merge, remove) trên Customer sẽ áp dụng cho Address liên quan
    // orphanRemoval = true: nếu một cart bị xóa khỏi danh sách cart Item của cart, nó cũng sẽ bị xóa khỏi DB
    // fetch = FetchType.LAZY: chỉ tải danh sách địa chỉ khi thực sự cần đến
    private List<CartItem> cartItem;

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

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    public List<CartItem> getCartItem() {
        return cartItem;
    }

    public void setCartItem(List<CartItem> cartItem) {
        this.cartItem = cartItem;
    }
}
