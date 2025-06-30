package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.GuestCartDTO;
import com.example.Doanlesg.services.GuestCartService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/guest/cart")
public class GuestCartItemController {

    private final GuestCartService guestCartService;

    // Giờ chỉ cần inject GuestCartService
    public GuestCartItemController(GuestCartService guestCartService) {
        this.guestCartService = guestCartService;
    }

    @GetMapping
    public ResponseEntity<GuestCartDTO> getCart(HttpSession session) {
        GuestCartDTO guestCart = guestCartService.getCart(session);
        return ResponseEntity.ok(guestCart);
    }

    /**
     * Đã sửa lại theo yêu cầu: chỉ cần nhận productId và quantity.
     * Dùng @RequestParam thay vì @RequestBody.
     */
    @PostMapping("/items/id")
    public ResponseEntity<GuestCartDTO> addItemToCart(@RequestParam Long productId, @RequestParam int quantity, HttpSession session) {
        GuestCartDTO guestCart = guestCartService.addItem(session, productId, quantity);
        return ResponseEntity.ok(guestCart);
    }

    @PostMapping("/items/updateid")
    public ResponseEntity<GuestCartDTO> updateItemQuantity(@PathVariable Long productId, @RequestParam int quantity, HttpSession session) {
        GuestCartDTO guestCart = guestCartService.updateItemQuantity(session, productId, quantity);
        return ResponseEntity.ok(guestCart);
    }

    @DeleteMapping("/items/deleteid")
    public ResponseEntity<GuestCartDTO> removeItemFromCart(@PathVariable Long productId, HttpSession session) {
        GuestCartDTO guestCart = guestCartService.removeItem(session, productId);
        return ResponseEntity.ok(guestCart);
    }
}