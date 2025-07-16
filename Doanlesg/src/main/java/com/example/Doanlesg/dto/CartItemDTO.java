package com.example.Doanlesg.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Setter
@Getter
@NoArgsConstructor
public class CartItemDTO {

    private Long cartItemId;
    private Long productId;
    private String productName;
    private int quantity;
    private BigDecimal priceAtAddition;
}