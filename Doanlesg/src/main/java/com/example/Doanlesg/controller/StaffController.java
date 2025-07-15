package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.*;
import com.example.Doanlesg.model.*;
import com.example.Doanlesg.services.*;
import jakarta.servlet.http.HttpSession;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// REMOVE: Spring Security import
// import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.*;

@RestController
@RequestMapping("/api/ver0.0.1/staff")
public class StaffController {

    private static final String ADMIN_ROLE = "ROLE_ADMIN";
    private static final String STAFF_ROLE = "ROLE_STAFF";

    private final ProductService productService;

    private final StaffServices staffServices;

    private final AccountServices accountServices; // Inject AccountServices

    private final AdminService adminService;

    private final CategoryService categoryService;

    public StaffController(StaffServices staffServices, AccountServices accountServices, AdminService adminService, CategoryService categoryService, ProductService productService) {
        this.staffServices = staffServices;
        this.accountServices = accountServices;
        this.adminService = adminService;
        this.categoryService = categoryService;
        this.productService = productService;
    }


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

    // Helper to check if user is either staff or admin
    private Account getStaffOrAdmin(HttpSession session) {
        Account account = getAuthorizedAccount(session, STAFF_ROLE);
        if (account == null) {
            // If not staff, check if admin
            account = getAuthorizedAccount(session, ADMIN_ROLE);
        }
        return account;
    }

    //Get products
    @GetMapping("/products")
    public ResponseEntity<?> getAllProducts(HttpSession session) {
        Account account = getStaffOrAdmin(session);
        if (account == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }
        // Return all products without filtering but with a high limit
        return getFilteredProducts(null, null, null, 0, Integer.MAX_VALUE, session);
    }

    // Get products with filtering and pagination - Chỉnh sửa lại nếu sử dụng
    @GetMapping("/products/filter")
    public ResponseEntity<?> getFilteredProducts(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(required = false) Boolean inStock,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            HttpSession session) {

        Account account = getStaffOrAdmin(session);
        if (account == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }

        List<Product> filteredProducts = staffServices.getAllProducts().stream()
                .filter(p -> name == null || p.getProductName().toLowerCase().contains(name.toLowerCase()))
                .filter(p -> categoryId == null || (p.getCategory() != null && p.getCategory().getId().equals(categoryId)))
                .filter(p -> inStock == null || p.isStatus() == inStock)
                .skip((long) page * size)
                .limit(size)
                .toList();

        return ResponseEntity.ok(filteredProducts);
    }

    //Create product
    @PostMapping("/products/new")
    public ResponseEntity<?> createProduct(
            @RequestPart("product") ProductDTO productDTO,
            @RequestPart(value = "image", required = false) MultipartFile imageFile,
            HttpSession session) {

        // Authorization check
        if (getStaffOrAdmin(session) == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }

        try {
            // Single, clean call to the service layer, passing both data and file
            Product createdProduct = staffServices.createProductWithImage(productDTO, imageFile);
            return ResponseEntity.ok(createdProduct);

        } catch (Exception e) {
            // Catch any errors thrown by the service (e.g., upload failure, database error)
            return new ResponseEntity<>("Lỗi khi tạo sản phẩm: " + e.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //Update product
    @PutMapping(value = "/products/{id}", consumes = { "multipart/form-data" })
    public ResponseEntity<?> updateProduct(
            @PathVariable Long id,
            @RequestPart("product") ProductDTO productDTO, // Maps the 'product' JSON part to the DTO
            @RequestPart(value = "image", required = false) MultipartFile image, // Maps the optional 'image' file part
            HttpSession session
    ) {
        Account account = getStaffOrAdmin(session);
        if (account == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }

        // You will now need to pass the image file to your service layer
        return staffServices.updateProduct(id, productDTO, image)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    //Delete product
    @DeleteMapping("/products/{id}")
    @Transactional
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, HttpSession session) {
        if (getAuthorizedAccount(session, ADMIN_ROLE) == null) { // Only ADMIN can delete
            return new ResponseEntity<>(HttpStatus.FORBIDDEN);
        }
        staffServices.deleteProduct(id);
        return ResponseEntity.noContent().build();
    }

    // Get product by ID - for both staff and admin
    @GetMapping("/products/{id}")
    public ResponseEntity<?> getProductById(@PathVariable Long id, HttpSession session) {
        Account account = getStaffOrAdmin(session);
        if (account == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }

        Optional<ProductDTO> product = Optional.ofNullable(productService.findById(id));
        if (product.isPresent()) {
            return ResponseEntity.ok(product.get());
        } else {
            return new ResponseEntity<>("Không tìm thấy sản phẩm.", HttpStatus.NOT_FOUND);
        }
    }

    // View all orders
    @GetMapping("/orders")
    public ResponseEntity<?> getAllOrders(HttpSession session) {
        if (getStaffOrAdmin(session) == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }
        List<OrderManagementDTO> orders = staffServices.getAllOrdersForManagement();
        return ResponseEntity.ok(orders);
    }

    // ... (Apply the same pattern for searchOrders and getOrderDetails)

    @GetMapping("/orders/search")
    public ResponseEntity<?> searchOrders(@RequestParam("keyword") String keyword, HttpSession session) {
        if (getStaffOrAdmin(session) == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.ok(staffServices.searchOrders(keyword));
    }

    @GetMapping("/orders/{id}")
    public ResponseEntity<?> getOrderDetails(@PathVariable Integer id, HttpSession session) {
        if (getStaffOrAdmin(session) == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }
        Order order = staffServices.getOrderDetails(id);
        if (order != null) {
            return ResponseEntity.ok(order);
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @PutMapping("/orders/{id}/status")
    public ResponseEntity<?> updateOrderStatus(
            @PathVariable Integer id,
            @RequestBody Map<String, String> payload,
            HttpSession session) {

        if (getStaffOrAdmin(session) == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }

        String newStatus = payload.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body("Trạng thái mới không được để trống.");
        }

        boolean success = staffServices.updateOrderStatus(id, newStatus);
        if (success) {
            return ResponseEntity.ok().build();
        } else {
            return ResponseEntity.notFound().build();
        }
    }

    @GetMapping("/dashboard/stats")
    public ResponseEntity<DashboardStatsDTO> getDashboardStats() {
        DashboardStatsDTO stats = adminService.getDashboardStatistics();
        return ResponseEntity.ok(stats);
    }

    // Copied from AuthController for role checking
    private List<String> getRolesForAccount(Account account) {
        List<String> roles = new ArrayList<>();
        if (account.getAdmin() != null) roles.add(ADMIN_ROLE);
        if (account.getStaff() != null) roles.add(STAFF_ROLE);
        if (account.getCustomer() != null) roles.add("ROLE_CUSTOMER");
        return roles;
    }

    // Get all accounts - for admin view
    @GetMapping("/accounts")
    public ResponseEntity<?> getAllAccounts(HttpSession session) {
        if (getAuthorizedAccount(session, ADMIN_ROLE) == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }

        List<AccountDisplayDTO> accounts = accountServices.getAllAccountsAsDTO();
        return ResponseEntity.ok(accounts);
    }

    // Get account by ID
    @GetMapping("/accounts/{id}")
    public ResponseEntity<?> getAccountById(@PathVariable Long id, HttpSession session) {
        if (getAuthorizedAccount(session, ADMIN_ROLE) == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }
        Account account = accountServices.findById(id);
        if (account == null) {
            return new ResponseEntity<>("Không tìm thấy tài khoản.", HttpStatus.NOT_FOUND);
        }
        return ResponseEntity.ok(account);
    }

    @GetMapping("/accounts/staff")
    public ResponseEntity<?> getStaffAccounts(HttpSession session) {
        if (getAuthorizedAccount(session, ADMIN_ROLE) == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }
        List<AccountStaffDTO> accounts = accountServices.getAllStaff();
        return ResponseEntity.ok(accounts);
    }

    // Create new customer account
    @PostMapping("/accounts/new-customer")
    public ResponseEntity<?> createCustomerAccount(@RequestBody AccountCustomerDTO request, HttpSession session) {
        if (getAuthorizedAccount(session, ADMIN_ROLE) == null) {
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
        if (getAuthorizedAccount(session, ADMIN_ROLE) == null) {
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
        if (getAuthorizedAccount(session, ADMIN_ROLE) == null) {
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
        if (getAuthorizedAccount(session, ADMIN_ROLE) == null) {
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
        if (getAuthorizedAccount(session, ADMIN_ROLE) == null) {
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
    
    @GetMapping("/categories")
    public ResponseEntity<?> getCategories(HttpSession session) {
        return ResponseEntity.ok(categoryService.getAll());
    }
}