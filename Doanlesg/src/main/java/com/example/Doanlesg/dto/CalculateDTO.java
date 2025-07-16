package com.example.Doanlesg.dto;

import java.math.BigDecimal;
import java.util.List;

public class CalculateDTO {

    private List<CartItemDTO> items;
    private BigDecimal totalPrice;

    public List<CartItemDTO> getItems() {
        return items;
    }

    public void setItems(List<CartItemDTO> items) {
        this.items = items;
    }

    public BigDecimal getTotalPrice() {
        return totalPrice;
    }

    public void setTotalPrice(BigDecimal totalPrice) {
        this.totalPrice = totalPrice;
    }
}

