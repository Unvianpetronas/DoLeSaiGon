package com.example.Doanlesg.Model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "category")
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "category_id")
    private Long id;

    @Column(name = "category_name", nullable = false)
    private String categoryName;

    @Column(name = "description", length = 255) // Annotation here
    private String description;

    @Column(name = "status",nullable = false,columnDefinition = "1")
    private boolean status;
    // 1 category have many product
    @OneToMany(
            mappedBy = "danhMuc", // This MUST match the field name in Product entity that maps to Category
            fetch = FetchType.LAZY // LAZY is default for collections, good for performance
            // Avoid CascadeType.ALL or orphanRemoval=true here unless deleting a category should delete all its products
    )
    private List<Product> products = new ArrayList<>(); // Initialize collection
    // --- End: Add @OneToMany relationship to Product ---


    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    // Default constructor (good practice for JPA)
    public Category() {
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}