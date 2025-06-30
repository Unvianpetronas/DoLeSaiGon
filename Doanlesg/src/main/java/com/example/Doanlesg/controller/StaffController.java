package com.example.Doanlesg.controller;

import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.model.Product;
import com.example.Doanlesg.model.Order;
import com.example.Doanlesg.services.AccountServices;
import com.example.Doanlesg.services.StaffServices;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// REMOVE: Spring Security import
// import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/staff") // Consider changing to /api/ver0.0.1/staff for consistency
public class StaffController {

    @Autowired
    private StaffServices staffServices;
    @Autowired
    private AccountServices accountServices; // Inject AccountServices

    // Helper to check authorization
    private Account getAuthorizedAccount(HttpSession session, String requiredRole) {
        Long accountId = (Long) session.getAttribute("account_id");
        if (accountId == null) {
            return null; // Not authenticated
        }
        Account account = accountServices.findById(accountId);
        if (account == null) {
            return null; // Account not found
        }
        List<String> roles = getRolesForAccount(account);
        if (roles.contains(requiredRole)) {
            return account; // Authorized
        }
        return null; // Not authorized
    }

    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts(HttpSession session) {
        if (getAuthorizedAccount(session, "ROLE_STAFF") == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(staffServices.getAllProducts());
    }

    @PostMapping("/products")
    public ResponseEntity<?> createProduct(@RequestBody Product product, HttpSession session) {
        if (getAuthorizedAccount(session, "ROLE_STAFF") == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(staffServices.createProduct(product));
    }

    @PutMapping("/products/{id}")
    @Transactional
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product, HttpSession session) {
        if (getAuthorizedAccount(session, "ROLE_STAFF") == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.of(staffServices.updateProduct(id, product));
    }

    @DeleteMapping("/products/{id}")
    @Transactional
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, HttpSession session) {
        if (getAuthorizedAccount(session, "ROLE_ADMIN") == null) { // Only ADMIN can delete
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        staffServices.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // View all orders
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(HttpSession session) {
        if (getAuthorizedAccount(session, "ROLE_STAFF") == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(staffServices.getAllOrders());
    }

    // ... (Apply the same pattern for searchOrders and getOrderDetails)

    @GetMapping("/orders/search")
    public ResponseEntity<?> searchOrders(@RequestParam("keyword") String keyword, HttpSession session) {
        if (getAuthorizedAccount(session, "ROLE_STAFF") == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(staffServices.searchOrders(keyword));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderDetails(@PathVariable Integer id, HttpSession session) {
        if (getAuthorizedAccount(session, "ROLE_STAFF") == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }
        Order order = staffServices.getOrderDetails(id);
        if (order != null) {
            return ResponseEntity.ok(order);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    // Copied from AuthController for role checking
    private List<String> getRolesForAccount(Account account) {
        List<String> roles = new ArrayList<>();
        if (account.getAdmin() != null) roles.add("ROLE_ADMIN");
        if (account.getStaff() != null) roles.add("ROLE_STAFF");
        if (account.getCustomer() != null) roles.add("ROLE_CUSTOMER");
        return roles;
    }
}