package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.AccountCustomerDTO;
import com.example.Doanlesg.dto.AccountStaffDTO;
import com.example.Doanlesg.model.*;
import com.example.Doanlesg.services.AccountServices;
import com.example.Doanlesg.services.StaffServices;
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
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/staff") // Consider changing to /api/ver0.0.1/staff for consistency
public class StaffController {

    @Value("${product.images.path}")
    private String uploadDir;

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

    // Helper to check if user is either staff or admin
    private Account getStaffOrAdmin(HttpSession session) {
        Account account = getAuthorizedAccount(session, "ROLE_STAFF");
        if (account == null) {
            // If not staff, check if admin
            account = getAuthorizedAccount(session, "ROLE_ADMIN");
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
            @RequestPart("product") Product product,
            @RequestPart("image") MultipartFile imageFile,
            HttpSession session) {

        if (getAuthorizedAccount(session, "ROLE_ADMIN") == null) {
            return new ResponseEntity<>("Truy cập bị từ chối. Chỉ quản trị viên mới có thể tạo sản phẩm.", HttpStatus.FORBIDDEN);
        }

        try {
            // Sanitize product name to use as filename
            String fileName = getImageName(product, imageFile);
            Path filePath = Paths.get(this.uploadDir, fileName);

            // Save the image file
            Files.copy(imageFile.getInputStream(), filePath, StandardCopyOption.REPLACE_EXISTING);

            return ResponseEntity.ok(staffServices.createProduct(product));

        } catch (IOException e) {
            return new ResponseEntity<>("Lỗi khi lưu ảnh sản phẩm.", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    //Helper function to generate image name
    private static String getImageName(Product product, MultipartFile imageFile) {
        String rawName = Optional.ofNullable(product.getProductName()).orElse("image");
        String safeName = rawName
                .toLowerCase()
                .replaceAll("[^a-z0-9]", "") // remove special chars
                .replaceAll("\\s+", "");     // remove whitespace

        // Extract file extension
        String originalName = imageFile.getOriginalFilename();
        String extension = "";
        if (originalName != null && originalName.contains(".")) {
            extension = originalName.substring(originalName.lastIndexOf('.'));
        }

        // Combine into final filename
        String fileName = safeName + extension;
        return fileName;
    }

    //Update product
    @PutMapping("/products/{id}")
    @Transactional
    public ResponseEntity<?> updateProduct(@PathVariable Long id, @RequestBody Product product, HttpSession session) {
        Account account = getStaffOrAdmin(session);
        if (account == null) {
            return new ResponseEntity<>("Truy cập bị từ chối.", HttpStatus.FORBIDDEN);
        }
        return ResponseEntity.of(staffServices.updateProduct(id, product));
    }

    //Delete product
    @DeleteMapping("/products/{id}")
    @Transactional
    public ResponseEntity<Void> deleteProduct(@PathVariable Long id, HttpSession session) {
        if (getAuthorizedAccount(session, "ROLE_ADMIN") == null) { // Only ADMIN can delete
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

        Optional<Product> product = staffServices.getProductById(id);
        if (product.isPresent()) {
            return ResponseEntity.ok(product.get());
        } else {
            return new ResponseEntity<>("Không tìm thấy sản phẩm.", HttpStatus.NOT_FOUND);
        }
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