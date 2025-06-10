package com.example.Doanlesg.model;

import jakarta.persistence.*;

@Entity
@Table(name = "shipping_method")
public class ShippingMethod {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "shipping_method_id")
    private Long id;

    @Column(name = "method_name", nullable = false, length = 50)
    private String methodName;

    @Column(name = "price", nullable = false)
    private double price;

    @Column(name = "status", nullable = false, columnDefinition = "BIT DEFAULT 1")
    private boolean status = true;

    public ShippingMethod() {
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getMethodName() {
        return methodName;
    }

    public void setMethodName(String methodName) {
        this.methodName = methodName;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public boolean isStatus() {
        return status;
    }

    public void setStatus(boolean status) {
        this.status = status;
    }
}
