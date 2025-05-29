package com.example.Doanlesg.Model;

import jakarta.persistence.*;

import java.math.BigDecimal;

@Entity
@Table(name = "Product")
public class Product {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "product_id")
    private Integer id;

    @Column(name ="product_name", nullable = false, length = 255)
    private String productName;

    @Column(name = "description")
    private String description;

    @Column(name = "price", nullable = false)
    private BigDecimal price;

    @Column(name = "stock_quantity", nullable = false )
    private int stockQuantity;

    @Column(name = "created_at", updatable = false) // updatable = false vì DB tự quản lý qua DEFAULT GETDATE()
    @Temporal(TemporalType.TIMESTAMP) // Hoặc dùng java.time.LocalDateTime với Hibernate phiên bản mới
    private java.util.Date createdAt;

    @ManyToOne(fetch = FetchType.LAZY) // Hoặc FetchType.EAGER tùy nhu cầu
    @JoinColumn(name = "category_id") // nullable = true là mặc định, khớp với SQL
    private Category danhMuc; // Hoặc Category nếu bạn đặt tên Entity là Category

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id",nullable = false)
    private WareHouse warehouseId;

}
