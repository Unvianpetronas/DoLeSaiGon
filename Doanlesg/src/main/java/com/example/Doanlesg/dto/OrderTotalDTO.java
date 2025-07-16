package com.example.Doanlesg.dto;

import java.math.BigDecimal;

public class OrderTotalDTO {
    private BigDecimal totalAmount;


    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }
}
