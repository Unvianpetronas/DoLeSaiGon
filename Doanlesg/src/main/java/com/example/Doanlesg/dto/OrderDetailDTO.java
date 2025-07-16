package com.example.Doanlesg.dto;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * A Data Transfer Object (DTO) representing the full details of a single order.
 * This is used for the "Order Details" page.
 */
@Setter
@Getter
@NoArgsConstructor
public class OrderDetailDTO {

    // Basic Order Info
    private Long id;
    private String orderCode;
    private Instant orderDate;
    private String orderStatus;

    // Receiver & Shipping Info
    private String receiverFullName;
    private String receiverEmail;
    private String receiverPhoneNumber;
    private String fullShippingAddress;
    private String notes;

    // Method Names for Display
    private String paymentMethodName;
    private String shippingMethodName;

    // Financial Breakdown
    private BigDecimal itemsSubtotal;
    private BigDecimal shippingFee;
    private BigDecimal voucherDiscount;
    private BigDecimal totalAmount;

    // List of items in the order
    private List<OrderItemDTO> orderItems;
}