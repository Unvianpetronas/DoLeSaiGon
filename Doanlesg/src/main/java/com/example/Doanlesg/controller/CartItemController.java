package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.CartItemDTO;
import com.example.Doanlesg.model.CartItem;
import com.example.Doanlesg.services.CartServices;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/ver0.0.1/cartItem")
public class CartItemController {
    private CartServices cartServices;
    public CartItemController(CartServices cartServices) {
        this.cartServices = cartServices;
    }
    @GetMapping("/allCartItem")
    public List<CartItemDTO> getAllCartItems(@RequestParam Long cartId) {
        return cartServices.getAllCartItems(cartId);
    }
}
