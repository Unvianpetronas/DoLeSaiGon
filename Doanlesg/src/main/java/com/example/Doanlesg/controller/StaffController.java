package com.example.Doanlesg.controller;

import com.example.Doanlesg.model.Product;
import com.example.Doanlesg.model.Order;
import com.example.Doanlesg.services.StaffServices;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/staff")
public class StaffController {

    @Autowired
    private StaffServices staffServices;

    @PreAuthorize("hasRole('ROLE_STAFF')")
    @GetMapping("/products")
    public List<Product> getAllProducts() {
        return staffServices.getAllProducts();
    }

    @PreAuthorize("hasRole('ROLE_STAFF')")
    @PostMapping("/products")
    public ResponseEntity<Product> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(staffServices.createProduct(product));
    }

    @PreAuthorize("hasRole('ROLE_STAFF')")
    @PutMapping("/products/{id}")
    @Transactional
    public ResponseEntity<Product> updateProduct(@PathVariable Long id, @RequestBody Product product) {
        return ResponseEntity.of(staffServices.updateProduct(id, product));
    }

    @PreAuthorize("hasRole('ROLE_ADMIN')")
    @DeleteMapping("/products/{id}")
    @Transactional
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id) {
        staffServices.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // View all orders
    @PreAuthorize("hasRole('ROLE_STAFF')")
    @GetMapping("/orders")
    public List<Order> getAllOrders() {
        return staffServices.getAllOrders();
    }

    // Search orders by keyword (status or customer name)
    @PreAuthorize("hasRole('ROLE_STAFF')")
    @GetMapping("/orders/search")
    public List<Order> searchOrders(@RequestParam("keyword") String keyword) {
        return staffServices.searchOrders(keyword);
    }

    // Get details of a specific order
    @PreAuthorize("hasRole('ROLE_STAFF')")
    @GetMapping("/orders/{id}")
    public ResponseEntity<Order> getOrderDetails(@PathVariable Integer id) {
        Order order = staffServices.getOrderDetails(id);
        if (order != null) {
            return ResponseEntity.ok(order);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

}