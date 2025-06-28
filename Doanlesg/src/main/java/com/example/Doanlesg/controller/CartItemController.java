package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.CartItemDTO;
import com.example.Doanlesg.model.Account;
// import com.example.Doanlesg.repository.AccountRepository; // No longer needed
import com.example.Doanlesg.services.AccountServices; // Import AccountServices
import com.example.Doanlesg.services.CartServices;
import jakarta.servlet.http.HttpSession;
import java.util.Collections; // Import HttpSession
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
// REMOVE: All Spring Security imports
// import org.springframework.security.core.annotation.AuthenticationPrincipal;
// import org.springframework.security.core.context.SecurityContextHolder;
// import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
// import java.util.Optional; // No longer needed

@RestController
@RequestMapping("/api/ver0.0.1/cartItem")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class CartItemController {

    private final static String ACCOUNT = "account_id";
    private final CartServices cartServices;
    // private final AccountRepository accountRepository; // Replace with AccountServices
    private final AccountServices accountServices;

    public CartItemController(CartServices cartServices, AccountServices accountServices) {
        this.cartServices = cartServices;
        this.accountServices = accountServices;
    }

    @GetMapping("/allCartItem")
    public List<CartItemDTO> getAllCartItems(HttpSession session) {
        Long accountId = (Long) session.getAttribute(ACCOUNT);
        if (accountId == null) {
            return Collections.emptyList();
        }
        Long cartId = accountServices.findById(accountId).getCart().getId();
        return cartServices.getAllCartItems(cartId);
    }

    @PostMapping("/add")
    public ResponseEntity<String> addCartItem(HttpSession session, @RequestBody CartItemDTO cartItemRequest) {
        // 1. Get account ID from session
        Long accountId = (Long) session.getAttribute(ACCOUNT);

        // 2. Check if user is logged in
        if (accountId == null) {
            return new ResponseEntity<>("Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng.", HttpStatus.UNAUTHORIZED); // 401
        }

        try {
            // 3. Call service directly with the account ID
            cartServices.addItem(accountId, cartItemRequest.getProductId(), cartItemRequest.getQuantity());
            return new ResponseEntity<>("Sản phẩm đã được thêm vào giỏ hàng.", HttpStatus.OK); // 200
        } catch (Exception e) {
            return new ResponseEntity<>("Lỗi khi thêm sản phẩm: " + e.getMessage(), HttpStatus.BAD_REQUEST); // 400
        }
    }

    @PutMapping("/updateId") // Use PUT for updates
    public ResponseEntity<String> updateQuantity(HttpSession session, @RequestParam Long productId, @RequestParam int quantity) {
        Long accountId = (Long) session.getAttribute(ACCOUNT);
        if (accountId == null) {
            return new ResponseEntity<>("Vui lòng đăng nhập.", HttpStatus.UNAUTHORIZED);
        }

        Account account = accountServices.findById(accountId);
        if (account != null && account.getCart() != null) {
            cartServices.updateItemQuantityFromCart(account.getCart().getId(), productId, quantity);
            return ResponseEntity.ok("Cập nhật số lượng thành công.");
        } else {
            return new ResponseEntity<>("Không tìm thấy tài khoản hoặc giỏ hàng.", HttpStatus.NOT_FOUND);
        }
    }

    @DeleteMapping("/removeId") // Use DELETE for removals
    public ResponseEntity<String> removeCartItem(HttpSession session, @RequestParam Long productId) {
        Long accountId = (Long) session.getAttribute(ACCOUNT);
        if (accountId == null) {
            return new ResponseEntity<>("Vui lòng đăng nhập.", HttpStatus.UNAUTHORIZED);
        }

        Account account = accountServices.findById(accountId);
        if (account != null && account.getCart() != null) {
            cartServices.RemoveItemFromCart(account.getCart().getId(), productId);
            return ResponseEntity.ok("Đã xóa sản phẩm khỏi giỏ hàng.");
        } else {
            return new ResponseEntity<>("Không tìm thấy tài khoản hoặc giỏ hàng.", HttpStatus.NOT_FOUND);
        }
    }
}