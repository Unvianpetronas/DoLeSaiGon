package com.example.Doanlesg.model;

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

    @Column(name = "description", nullable = false)
    private String description;

    @Column(name = "parent_category_id",nullable = false)
    @JoinColumn(name = "category_id", nullable = false)
    private Long parentCategoryId;

    // 1 category have many product
    @OneToMany(
            mappedBy = "category", // This MUST match the field name in Product entity that maps to Category
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

    public Category() {
    }

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

    public Long getParentCaregoryId() {
        return parentCategoryId;
    }

    public void setParentCaregoryId(Long parentCaregoryId) {
        this.parentCategoryId = parentCaregoryId;
    }
}