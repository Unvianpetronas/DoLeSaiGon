package com.example.Doanlesg.dto;

import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

/**
 * A DTO representing a single line item within an order.
 * Used inside OrderDetailDTO.
 */
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor // Useful for creating this DTO easily in a stream/map
public class OrderItemDTO {

    private Long productId;
    private String productName;
    private int quantity;
    private BigDecimal price; // Price per unit at the time of purchase
    private BigDecimal total; // Line item total (price * quantity)

}
