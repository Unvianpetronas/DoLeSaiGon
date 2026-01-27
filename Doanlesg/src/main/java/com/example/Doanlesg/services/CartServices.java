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
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

@Service
public class CartServices {
    private final CartRepository cartRepository;
    private final CartItemRepository cartItemRepository;
    private final ProductRepository productRepository;
    private final AccountRepository accountRepository;
    private static final Logger logger = LoggerFactory.getLogger(CartServices.class);

    @Autowired
    public CartServices(CartRepository cartRepository, CartItemRepository cartItemRepository,
                        ProductRepository productRepository, AccountRepository accountRepository) {
        this.cartRepository = cartRepository;
        this.cartItemRepository = cartItemRepository;
        this.productRepository = productRepository;
        this.accountRepository = accountRepository;
    }

    /**
     * Validate ownership - Kiểm tra cart có thuộc về account không
     * @param accountId - ID của account
     * @param cartId - ID của cart cần kiểm tra
     * @throws EntityNotFoundException nếu account không tồn tại
     * @throws SecurityException nếu cart không thuộc về account
     */
    private void validateOwnership(Long accountId, Long cartId) {
        logger.debug("Validating ownership - accountId: {}, cartId: {}", accountId, cartId);

        Account account = accountRepository.findById(accountId)
                .orElseThrow(() -> {
                    logger.error("Account not found with ID: {}", accountId);
                    return new EntityNotFoundException("Account not found with ID: " + accountId);
                });

        if (account.getCart() == null) {
            logger.error("Account {} has no cart", accountId);
            throw new EntityNotFoundException("Account has no cart");
        }

        if (!account.getCart().getId().equals(cartId)) {
            logger.warn("Security violation - Account {} tried to access cart {}, but owns cart {}",
                    accountId, cartId, account.getCart().getId());
            throw new SecurityException("You don't have permission to access this cart");
        }

        logger.debug("Ownership validated successfully");
    }

    /**
     * Lấy tất cả items trong cart
     */
    @Transactional
    public List<CartItemDTO> getAllCartItems(Long cartId) {
        logger.info("Getting all cart items for cartId: {}", cartId);

        try {
            List<CartItem> items = cartItemRepository.findAllByCart_Id(cartId);
            logger.info("Found {} items in cart {}", items.size(), cartId);

            List<CartItemDTO> result = items.stream()
                    .map(this::convertToDto)
                    .toList();

            return result;

        } catch (Exception e) {
            logger.error("Error getting cart items for cartId {}: {}", cartId, e.getMessage(), e);
            throw new RuntimeException("Failed to get cart items: " + e.getMessage(), e);
        }
    }

    /**
     * Lấy tất cả items trong cart VỚI ownership check
     */
    @Transactional
    public List<CartItemDTO> getAllCartItems(Long accountId, Long cartId) {
        logger.info("Getting all cart items - accountId: {}, cartId: {}", accountId, cartId);

        // Validate ownership
        validateOwnership(accountId, cartId);

        return getAllCartItems(cartId);
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
        dto.setPriceAtAddition(BigDecimal.valueOf(cartItem.getPriceAtAddition()));
        return dto;
    }

    /**
     * Thêm item vào cart
     */
    @Transactional
    public void addItem(Long cartId, Long productId, int quantity) {
        logger.info("Adding item to cart - cartId: {}, productId: {}, quantity: {}",
                cartId, productId, quantity);

        try {
            // Validate cart exists
            Cart cart = cartRepository.findById(cartId)
                    .orElseThrow(() -> {
                        logger.error("Cart not found with ID: {}", cartId);
                        return new EntityNotFoundException("Cart not found with ID: " + cartId);
                    });

            // Check if item already exists
            CartItem existingItem = cartItemRepository.findByCartIdAndProductId(cartId, productId);

            if (existingItem != null) {
                logger.debug("Product {} already exists in cart {}, updating quantity from {} to {}",
                        productId, cartId, existingItem.getQuantity(), existingItem.getQuantity() + quantity);

                int newQuantity = existingItem.getQuantity() + quantity;
                existingItem.setQuantity(newQuantity);
                cartItemRepository.save(existingItem);

                logger.info("Successfully updated item quantity in cart {}", cartId);
            } else {
                // Add new item
                Product product = productRepository.findById(productId)
                        .orElseThrow(() -> {
                            logger.error("Product not found with ID: {}", productId);
                            return new EntityNotFoundException("Product not found with ID: " + productId);
                        });

                CartItem newItem = new CartItem();
                newItem.setCart(cart);
                newItem.setProduct(product);
                newItem.setQuantity(quantity);
                newItem.setPriceAtAddition(product.getPrice().doubleValue());
                cartItemRepository.save(newItem);

                logger.info("Successfully added new item (productId: {}) to cart {}", productId, cartId);
            }

        } catch (EntityNotFoundException e) {
            logger.error("Entity not found while adding item: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error adding item to cart {}: {}", cartId, e.getMessage(), e);
            throw new RuntimeException("Failed to add item to cart: " + e.getMessage(), e);
        }
    }

    /**
     * Thêm item vào cart VỚI ownership check
     */
    @Transactional
    public void addItem(Long accountId, Long cartId, Long productId, int quantity) {
        logger.info("Adding item with ownership check - accountId: {}, cartId: {}, productId: {}, quantity: {}",
                accountId, cartId, productId, quantity);

        // Validate ownership
        validateOwnership(accountId, cartId);

        addItem(cartId, productId, quantity);
    }

    /**
     * Xóa item khỏi cart
     */
    @Transactional
    public void removeItemFromCart(Long cartId, Long productId) {
        logger.info("Removing item from cart - cartId: {}, productId: {}", cartId, productId);

        try {
            Cart cart = cartRepository.findById(cartId)
                    .orElseThrow(() -> {
                        logger.error("Cart not found with ID: {}", cartId);
                        return new EntityNotFoundException("Không tìm thấy giỏ hàng với ID: " + cartId);
                    });

            CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cart.getId(), productId);

            if (cartItem != null) {
                cartItemRepository.delete(cartItem);
                logger.info("Successfully removed product {} from cart {}", productId, cartId);
            } else {
                logger.warn("Product {} not found in cart {}", productId, cartId);
                throw new EntityNotFoundException("Không tìm thấy sản phẩm ID: " + productId + " trong giỏ hàng");
            }

        } catch (EntityNotFoundException e) {
            logger.error("Entity not found while removing item: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error removing item from cart {}: {}", cartId, e.getMessage(), e);
            throw new RuntimeException("Failed to remove item from cart: " + e.getMessage(), e);
        }
    }

    /**
     * Xóa item khỏi cart VỚI ownership check
     */
    @Transactional
    public void removeItemFromCart(Long accountId, Long cartId, Long productId) {
        logger.info("Removing item with ownership check - accountId: {}, cartId: {}, productId: {}",
                accountId, cartId, productId);

        // Validate ownership
        validateOwnership(accountId, cartId);

        removeItemFromCart(cartId, productId);
    }

    /**
     * Cập nhật quantity của item trong cart
     */
    @Transactional
    public void updateItemQuantityFromCart(Long cartId, Long productId, int newQuantity) {
        logger.info("Updating item quantity - cartId: {}, productId: {}, newQuantity: {}",
                cartId, productId, newQuantity);

        try {
            // Validate quantity
            if (newQuantity < 0) {
                logger.warn("Invalid quantity {} for product {} in cart {}", newQuantity, productId, cartId);
                throw new IllegalArgumentException("Số lượng không thể là số âm.");
            }

            // Validate cart exists
            if (!cartRepository.existsById(cartId)) {
                logger.error("Cart not found with ID: {}", cartId);
                throw new EntityNotFoundException("Không tìm thấy giỏ hàng với ID: " + cartId);
            }

            // Find cart item
            CartItem cartItem = cartItemRepository.findByCartIdAndProductId(cartId, productId);
            if (cartItem == null) {
                logger.error("Product {} not found in cart {}", productId, cartId);
                throw new EntityNotFoundException("Không tìm thấy sản phẩm ID: " + productId + " trong giỏ hàng.");
            }

            // Update or delete
            if (newQuantity == 0) {
                cartItemRepository.delete(cartItem);
                logger.info("Deleted product {} from cart {} (quantity set to 0)", productId, cartId);
            } else {
                int oldQuantity = cartItem.getQuantity();
                cartItem.setQuantity(newQuantity);
                cartItemRepository.save(cartItem);
                logger.info("Updated product {} quantity in cart {} from {} to {}",
                        productId, cartId, oldQuantity, newQuantity);
            }

        } catch (IllegalArgumentException | EntityNotFoundException e) {
            logger.error("Error updating item quantity: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error updating item quantity in cart {}: {}", cartId, e.getMessage(), e);
            throw new RuntimeException("Failed to update item quantity: " + e.getMessage(), e);
        }
    }

    /**
     * Cập nhật quantity VỚI ownership check
     */
    @Transactional
    public void updateItemQuantityFromCart(Long accountId, Long cartId, Long productId, int newQuantity) {
        logger.info("Updating item quantity with ownership check - accountId: {}, cartId: {}, productId: {}, newQuantity: {}",
                accountId, cartId, productId, newQuantity);

        // Validate ownership
        validateOwnership(accountId, cartId);

        updateItemQuantityFromCart(cartId, productId, newQuantity);
    }

    /**
     * Clear tất cả items trong cart
     */
    @Transactional
    public void clearCart(Long cartId) {
        logger.info("Clearing all items from cart {}", cartId);

        try {
            Cart cart = cartRepository.findById(cartId)
                    .orElseThrow(() -> {
                        logger.error("Cart not found with ID: {}", cartId);
                        return new EntityNotFoundException("Cart not found with ID: " + cartId);
                    });

            List<CartItem> items = cartItemRepository.findAllByCart_Id(cartId);
            int itemCount = items.size();

            cartItemRepository.deleteAll(items);

            logger.info("Successfully cleared {} items from cart {}", itemCount, cartId);

        } catch (EntityNotFoundException e) {
            logger.error("Error clearing cart: {}", e.getMessage());
            throw e;
        } catch (Exception e) {
            logger.error("Unexpected error clearing cart {}: {}", cartId, e.getMessage(), e);
            throw new RuntimeException("Failed to clear cart: " + e.getMessage(), e);
        }
    }

    /**
     * Clear cart VỚI ownership check
     */
    @Transactional
    public void clearCart(Long accountId, Long cartId) {
        logger.info("Clearing cart with ownership check - accountId: {}, cartId: {}", accountId, cartId);

        // Validate ownership
        validateOwnership(accountId, cartId);

        clearCart(cartId);
    }
}
