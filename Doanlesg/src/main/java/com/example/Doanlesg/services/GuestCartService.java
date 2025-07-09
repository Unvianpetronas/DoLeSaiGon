package com.example.Doanlesg.services;

import com.example.Doanlesg.dto.CartItemDTO;
import com.example.Doanlesg.dto.GuestCartDTO;
import com.example.Doanlesg.model.Product;
import com.example.Doanlesg.repository.ProductRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.servlet.http.HttpSession;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;

@Service
public class GuestCartService {

    private final ProductRepository productRepository;
    private static final String GUEST_CART_SESSION_KEY = "guestCart";

    public GuestCartService(ProductRepository productRepository) {
        this.productRepository = productRepository;
    }

    /**
     * Lấy giỏ hàng từ session, nếu chưa có thì tạo mới.
     */
    private GuestCartDTO getOrCreateCart(HttpSession session) {
        GuestCartDTO guestCart = (GuestCartDTO) session.getAttribute(GUEST_CART_SESSION_KEY);
        if (guestCart == null) {
            guestCart = new GuestCartDTO();
            session.setAttribute(GUEST_CART_SESSION_KEY, guestCart);
        }
        return guestCart;
    }

    /**
     * Tính toán lại tổng tiền cho giỏ hàng.
     */
    private void calculateTotal(GuestCartDTO cart) {
        BigDecimal totalAmount = cart.getItems().stream()
                .map(item -> item.getPriceAtAddition().multiply(new BigDecimal(item.getQuantity())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        cart.setTotalAmount(totalAmount);
    }

    /**
     * Lấy giỏ hàng hiện tại, đã bao gồm tổng tiền.
     */
    public GuestCartDTO getCart(HttpSession session) {
        GuestCartDTO cart = getOrCreateCart(session);
        calculateTotal(cart);
        return cart;
    }

    /**
     * Thêm một sản phẩm vào giỏ hàng.
     */
    public GuestCartDTO addItem(HttpSession session, Long productId, int quantity) {
        GuestCartDTO cart = getOrCreateCart(session);
        Product product = productRepository.findById(productId)
                .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm với ID: " + productId));

        CartItemDTO newItem = new CartItemDTO();
        newItem.setProductId(product.getId());
        newItem.setProductName(product.getProductName());
        newItem.setQuantity(quantity);
        newItem.setPriceAtAddition(product.getPrice());

        cart.addItem(newItem);
        session.setAttribute(GUEST_CART_SESSION_KEY, cart);
        calculateTotal(cart);
        return cart;
    }

    /**
     * Cập nhật số lượng sản phẩm.
     */
    public GuestCartDTO updateItemQuantity(HttpSession session, Long productId, int newQuantity) {
        GuestCartDTO cart = getOrCreateCart(session);
        cart.updateItemQuantity(productId, newQuantity);
        session.setAttribute(GUEST_CART_SESSION_KEY, cart);
        calculateTotal(cart);
        return cart;
    }

    /**
     * Xóa một sản phẩm khỏi giỏ hàng.
     */
    public GuestCartDTO removeItem(HttpSession session, Long productId) {
        GuestCartDTO cart = getOrCreateCart(session);
        cart.removeItem(productId);
        session.setAttribute(GUEST_CART_SESSION_KEY, cart);
        calculateTotal(cart);
        return cart;
    }
}