package com.example.Doanlesg.services;

import com.example.Doanlesg.dto.CartItemDTO;
import com.example.Doanlesg.repository.AccountRepository;
import com.example.Doanlesg.repository.CartItemRepository;
import com.example.Doanlesg.repository.CartRepository;
import com.example.Doanlesg.repository.ProductRepository;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import com.example.Doanlesg.model.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartServices {
    private CartRepository cartRepository;
    private CartItemRepository cartItemRepository;
    private ProductRepository productRepository;
    private AccountRepository accountRepository;

    @Autowired
    public CartServices(CartRepository cartRepository, CartItemRepository cartItemRepository, ProductRepository productRepository, AccountRepository accountRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.accountRepository = accountRepository;
    }
    @Transactional
    public List<CartItemDTO> getAllCartItems(Long cartId) {
        List<CartItem> items = cartItemRepository.findAllByCart_Id(cartId);

        // Chuyển đổi từ List<CartItem> (Entity) sang List<CartItemDTO>
        return items.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
    private CartItemDTO convertToDto(CartItem cartItem) {
        CartItemDTO dto = new CartItemDTO();
        dto.setCartItemId(cartItem.getId());
        dto.setQuantity(cartItem.getQuantity());

        // Lấy thông tin từ Product liên quan một cách an toàn
        Product product = cartItem.getProduct();
        if (product != null) {
            dto.setProductId((long) product.getId());
            dto.setProductName(product.getProductName());
        }


        dto.setPriceAtAddition(BigDecimal.valueOf(cartItem.getPriceAtAddition()));

        return dto;
    }

    @Transactional
    public void addItem(Long accountID, Long productID, int quantity){
        Account account = accountRepository.findById(accountID).orElse(null);
        Cart cart = cartRepository.findById(accountID)
                .orElseGet(() -> {
                    Cart newCart = new Cart();
                    newCart.setAccount(account);
                    return cartRepository.save(newCart);
                });
        Optional<CartItem> existItem = Optional.ofNullable(cartItemRepository.findByCartIdAndProductId(cart.getId(), productID));
        if(existItem.isPresent()){
            CartItem cartItem = existItem.get();
            cartItem.setQuantity(cartItem.getQuantity()+quantity);
            cartItemRepository.save(cartItem);
        }else{
            Product product = productRepository.findById(productID)
                    .orElseThrow(() -> new IllegalArgumentException("Product not found with ID: " + productID));
            CartItem cartItem = new CartItem();
            cartItem.setCart(cart);
            cartItem.setProduct(product);
            cartItem.setQuantity(quantity);
            cartItemRepository.save(cartItem);

        }
    }

    @Transactional
    public void RemoveItemFromCart(Long accountid, Long productid){
        Optional<Cart> cart = cartRepository.findById(accountid);
        if(cart.isPresent()){
            CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cart.get().getId(), productid);
            if(cartItem != null){
                cartItemRepository.delete(cartItem);
            }
        }
    }

    @Transactional
    public void UpdateItemQuantityFormCart(Long accountID, Long productID, int quantity){
        Optional<Cart> cart = cartRepository.findById(accountID);
        if(cart.isPresent()){
            CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cart.get().getId(), productID);
            if(cartItem != null){
                cartItem.setQuantity(quantity);
                cartItemRepository.save(cartItem);
            }
        }
    }
}
