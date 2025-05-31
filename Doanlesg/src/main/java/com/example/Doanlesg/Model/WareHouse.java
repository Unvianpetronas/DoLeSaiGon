package com.example.Doanlesg.Model;

import jakarta.persistence.*;

import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "Kho")
public class WareHouse {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "warehouse_id")
    private Integer id;

    @Column(name = "warehouse_name",nullable = false)
    private String warehouseName;

    @Column(name = "location")
    private String location;

    @Column(name = "status",nullable = false,columnDefinition = "1")
    private boolean status;
    @OneToMany(
            mappedBy = "warehouseId", // This MUST match the field name in Product entity that maps to Warehouse
            fetch = FetchType.LAZY
            // Avoid CascadeType.ALL or orphanRemoval=true here
    )
    private List<Product> products = new ArrayList<>();

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }

    public List<Product> getProducts() {
        return products;
    }

    public void setProducts(List<Product> products) {
        this.products = products;
    }

    public Integer getId() {
        return id;
    }

    public void setId(Integer id) {
        this.id = id;
    }

    public String getWarehouseName() {
        return warehouseName;
    }

    public void setWarehouseName(String warehouseName) {
        this.warehouseName = warehouseName;
    }

    public String getLocation() {
        return location;
    }

    public void setLocation(String location) {
        this.location = location;
    }
}
