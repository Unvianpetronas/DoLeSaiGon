package com.example.Doanlesg.dto;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

public class GuestCartDTO {

    private List<CartItemDTO> items = new ArrayList<>();
    private BigDecimal totalAmount = BigDecimal.ZERO;


    public List<CartItemDTO> getItems() {
        return items;
    }

    public void setItems(List<CartItemDTO> items) {
        this.items = items;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    // --- Các phương thức xử lý logic được giữ lại ---
    public void addItem(CartItemDTO newItem) {
        Optional<CartItemDTO> existingItem = items.stream()
                .filter(item -> item.getProductId().equals(newItem.getProductId()))
                .findFirst();

        if (existingItem.isPresent()) {
            CartItemDTO item = existingItem.get();
            item.setQuantity(item.getQuantity() + newItem.getQuantity());
        } else {
            items.add(newItem);
        }
    }

    public void removeItem(Long productId) {
        items.removeIf(item -> item.getProductId().equals(productId));
    }

    public void updateItemQuantity(Long productId, int newQuantity) {
        if (newQuantity < 0) {
            throw new IllegalArgumentException("Số lượng không thể là số âm.");
        }
        if (newQuantity == 0) {
            removeItem(productId);
        } else {
            items.stream()
                    .filter(item -> item.getProductId().equals(productId))
                    .findFirst()
                    .ifPresent(item -> item.setQuantity(newQuantity));
        }
    }
}