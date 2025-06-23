package com.example.Doanlesg.services;

import com.example.Doanlesg.dto.CalculateDTO;
import com.example.Doanlesg.dto.CartItemDTO;
import com.example.Doanlesg.dto.GuestCartDTO;
import com.example.Doanlesg.model.Product;
import com.example.Doanlesg.repository.ProductRepository;
import com.example.Doanlesg.repository.VourcherRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
public class GuestService {
    private final ProductRepository productRepository;
    private final VourcherRepository vourcherRepository;

    public GuestService(ProductRepository productRepository, VourcherRepository vourcherRepository) {
        this.productRepository = productRepository;
        this.vourcherRepository = vourcherRepository;
    }

    /**
     * Tính toán thông tin giỏ hàng từ GuestCartDTO.
     * Phương thức này sẽ xác thực lại thông tin sản phẩm từ DB để đảm bảo tính toàn vẹn,
     * đặc biệt là giá cả, thay vì tin tưởng dữ liệu từ client.
     *
     * @param guestCart DTO chứa danh sách các sản phẩm và số lượng từ client.
     * @return Một đối tượng CalculatedCartDTO chứa thông tin chi tiết và tổng tiền đã được xác thực.
     */
    public CalculateDTO calculateGuestCart(GuestCartDTO guestCart) {
        List<CartItemDTO> verifiedItems = new ArrayList<>();
        BigDecimal totalPrice = BigDecimal.ZERO;

        if (guestCart.getItems() == null) {
            throw new IllegalArgumentException("Danh sách sản phẩm không được rỗng.");
        }

        for (CartItemDTO itemFromClient : guestCart.getItems()) {
            if (itemFromClient.getProductId() == null || itemFromClient.getQuantity() <= 0) {
                continue; // Bỏ qua các item không hợp lệ
            }

            // Tìm sản phẩm trong DB để lấy thông tin chính xác
            Product product = productRepository.findById(itemFromClient.getProductId())
                    .orElseThrow(() -> new EntityNotFoundException("Không tìm thấy sản phẩm với ID: " + itemFromClient.getProductId()));

            // Tạo một CartItemDTO mới với thông tin đã được xác thực từ DB
            CartItemDTO verifiedItem = new CartItemDTO();
            verifiedItem.setProductId(product.getId());
            verifiedItem.setProductName(product.getProductName());
            verifiedItem.setQuantity(itemFromClient.getQuantity());
            verifiedItem.setPriceAtAddition(product.getPrice()); // Lấy giá từ DB, không tin giá từ client

            verifiedItems.add(verifiedItem);

            // Cộng vào tổng tiền
            BigDecimal itemTotal = product.getPrice().multiply(BigDecimal.valueOf(verifiedItem.getQuantity()));
            totalPrice = totalPrice.add(itemTotal);
        }

        CalculateDTO calculatedCart = new CalculateDTO();
        calculatedCart.setItems(verifiedItems);
        calculatedCart.setTotalPrice(totalPrice);

        return calculatedCart;
    }
}
