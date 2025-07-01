package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.AccountCustomerDTO;
import com.example.Doanlesg.dto.AccountStaffDTO;
import com.example.Doanlesg.model.*;
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

    // Get all accounts - for admin view
    @GetMapping("/accounts")
    public ResponseEntity<?> getAllAccounts(HttpSession session) {
        if (getAuthorizedAccount(session, "ROLE_ADMIN") == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }
        List<Account> accounts = accountServices.getAllAccounts();
        return ResponseEntity.ok(accounts);
    }

    // Get account by ID
    @GetMapping("/accounts/{id}")
    public ResponseEntity<?> getAccountById(@PathVariable Long id, HttpSession session) {
        if (getAuthorizedAccount(session, "ROLE_ADMIN") == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }
        Account account = accountServices.findById(id);
        if (account == null) {
            return new ResponseEntity<>("Không tìm thấy tài khoản.", HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(account);
    }

    // Create new customer account
    @PostMapping("/accounts/new-customer")
    public ResponseEntity<?> createCustomerAccount(@RequestBody AccountCustomerDTO request, HttpSession session) {
        if (getAuthorizedAccount(session, "ROLE_ADMIN") == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }

        // Build Account
        Account account = new Account();
        account.setEmail(request.getEmail());
        account.setPasswordHash(request.getPassword());

        // Build Customer
        Customer customer = new Customer();
        customer.setFullName(request.getFullName());
        customer.setPhoneNumber(request.getPhoneNumber());

        Account createdAccount = accountServices.createCustomerAccount(account, customer);
        if (createdAccount != null) {
            return ResponseEntity.ok(createdAccount);
        } else {
            return new ResponseEntity<>("Tạo tài khoản thất bại - email đã tồn tại.", HttpStatus.BAD_REQUEST);
        }
    }

    // Create new staff account
    @PostMapping("/accounts/new-staff")
    public ResponseEntity<?> createStaffAccount(@RequestBody AccountStaffDTO request, HttpSession session) {
        if (getAuthorizedAccount(session, "ROLE_ADMIN") == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }

        // Build Account
        Account account = new Account();
        account.setEmail(request.getEmail());
        account.setPasswordHash(request.getPassword());

        // Build Staff
        Staff staff = new Staff();
        staff.setFullName(request.getFullName());
        staff.setPhoneNumber(request.getPhoneNumber());
        staff.setEmployeeId(request.getEmployeeId());
        staff.setDepartment(request.getDepartment());

        Account createdAccount = accountServices.createStaffAccount(account, staff);
        if (createdAccount != null) {
            return ResponseEntity.ok(createdAccount);
        } else {
            return new ResponseEntity<>("Tạo tài khoản thất bại - email đã tồn tại.", HttpStatus.BAD_REQUEST);
        }
    }

    // Update existing customer account
    @PutMapping("/accounts/customer-{id}")
    public ResponseEntity<?> updateCustomerAccount(@PathVariable Long id, @RequestBody AccountCustomerDTO request, HttpSession session) {
        if (getAuthorizedAccount(session, "ROLE_ADMIN") == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }

        boolean success = accountServices.updateCustomerAccount(id, request.getAccount(), request.getCustomer());
        if (success) {
            return new ResponseEntity<>("Cập nhật thành công", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Cập nhật thất bại - Tài khoản không tồn tại hoặc email đã được sử dụng", HttpStatus.BAD_REQUEST);
        }
    }

    // Update existing staff account
    @PutMapping("/accounts/staff-{id}")
    public ResponseEntity<?> updateStaffAccount(@PathVariable Long id, @RequestBody AccountStaffDTO request, HttpSession session) {
        if (getAuthorizedAccount(session, "ROLE_ADMIN") == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }

        boolean success = accountServices.updateStaffAccount(id, request.getAccount(), request.getStaff());
        if (success) {
            return new ResponseEntity<>("Cập nhật thành công", HttpStatus.OK);
        } else {
            return new ResponseEntity<>("Cập nhật thất bại - Tài khoản không tồn tại hoặc email đã được sử dụng", HttpStatus.BAD_REQUEST);
        }
    }

    // Delete account
    @DeleteMapping("/accounts/{id}")
    public ResponseEntity<?> deleteAccount(@PathVariable Long id, HttpSession session) {
        if (getAuthorizedAccount(session, "ROLE_ADMIN") == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }
        Account account = accountServices.findById(id);
        if (account == null) {
            return new ResponseEntity<>("Không tìm thấy tài khoản.", HttpStatus.NOT_FOUND);
        }
        boolean deleted = accountServices.deleteAccount(account);
        if (deleted) {
            return new ResponseEntity<>(HttpStatus.NO_CONTENT);
        } else {
            return new ResponseEntity<>("Xóa thất bại", HttpStatus.BAD_REQUEST);
        }
    }
}