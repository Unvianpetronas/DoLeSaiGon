package com.example.Doanlesg.services;

import com.example.Doanlesg.dto.CartItemDTO;
import com.example.Doanlesg.repository.AccountRepository;
import com.example.Doanlesg.repository.CartItemRepository;
import com.example.Doanlesg.repository.CartRepository;
import com.example.Doanlesg.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.Doanlesg.model.*;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class CartServices {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final AccountRepository accountRepository;

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

        Product product = cartItem.getProduct();
        if (product != null) {
            dto.setProductId(product.getId());
            dto.setProductName(product.getProductName());
        }
        dto.setPriceAtAddition(cartItem.getPriceAtAddition());
        return dto;
    }

    @Transactional
    public void addItem(Long cartid, Long productID, int quantity){
        Cart cart = cartRepository.findById(cartid).orElseThrow(()->new EntityNotFoundException("Cart not found"));
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
            cartItem.setPriceAtAddition(product.getPrice());
            cartItemRepository.save(cartItem);
        }
    }

    @Transactional
    public void RemoveItemFromCart(Long cartId, Long productid){
        Cart cart = cartRepository.findById(cartId).orElseThrow(() -> new EntityNotFoundException("không tìm thấy giỏ hàng"));
            CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productid);
            if(cartItem != null){
                cartItemRepository.delete(cartItem);
            }else{
                throw new EntityNotFoundException("Không tìm thấy sản Phẩm ID: "+productid);
            }
    }

    @Transactional
    public void updateItemQuantityFromCart(Long cartId, Long productId, int newQuantity) {
        if (newQuantity < 0) {
            throw new IllegalArgumentException("Số lượng không thể là số âm.");
        }
        if (!cartRepository.existsById(cartId)) {
            throw new EntityNotFoundException("Không tìm thấy giỏ hàng với ID: " + cartId);
        }
        CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cartId, productId);
        if (cartItem == null) {
            throw new EntityNotFoundException("Không tìm thấy sản phẩm ID: " + productId + " trong giỏ hàng.");
        }
        if (newQuantity == 0) {
            cartItemRepository.delete(cartItem);
        } else {
            cartItem.setQuantity(newQuantity);
            cartItemRepository.save(cartItem);
        }
    }
}
