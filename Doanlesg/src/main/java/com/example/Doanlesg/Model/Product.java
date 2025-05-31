package com.example.Doanlesg.Model;

import jakarta.persistence.*;

import java.math.BigDecimal;
import java.util.Date;

@Entity
@Table(name = "Product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Long id;

    @Column(name ="product_name", nullable = false, length = 255)
    private String productName;

    @Column(name = "description")
    private String description;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "stock_quantity", nullable = false )
    private int stockQuantity;

    @Column(name = "status",nullable = false,columnDefinition = "1")
    private boolean status;

    @Column(name = "created_at", updatable = false) // updatable = false vì DB tự quản lý qua DEFAULT GETDATE()
    @Temporal(TemporalType.TIMESTAMP) // Hoặc dùng java.time.LocalDateTime với Hibernate phiên bản mới
    private java.util.Date createdAt;

    @ManyToOne(fetch = FetchType.LAZY) // Hoặc FetchType.EAGER tùy nhu cầu
    @JoinColumn(name = "category_id") // nullable = true là mặc định, khớp với SQL
    private Category danhMuc; // Hoặc Category nếu bạn đặt tên Entity là Category

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getProductName() {
        return productName;
    }

    public void setProductName(String productName) {
        this.productName = productName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public int getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(int stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public Date getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(Date createdAt) {
        this.createdAt = createdAt;
    }

    public Category getDanhMuc() {
        return danhMuc;
    }

    public void setDanhMuc(Category danhMuc) {
        this.danhMuc = danhMuc;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

}
