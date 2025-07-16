package com.example.Doanlesg.dto;

import com.example.Doanlesg.model.Order;
import lombok.Data;
import java.math.BigDecimal;
import java.time.Instant;

/**
 * A DTO specifically for the admin/staff order management table.
 * It contains all the necessary details for display.
 */
@Data
public class OrderManagementDTO {
    private Long id;
    private String orderCode;
    private Long customerId;
    private String receiverFullName;
    private String receiverPhoneNumber;
    private String fullShippingAddress;
    private Instant orderDate;
    private BigDecimal totalAmount;
    private String shippingMethodName;
    private String orderStatus;

    // Helper method to convert an Order entity to this DTO
    public static OrderManagementDTO fromEntity(Order order) {
        OrderManagementDTO dto = new OrderManagementDTO();
        dto.setId(order.getId());
        dto.setOrderCode(order.getCode());
        dto.setOrderDate(order.getOrderDate());
        dto.setTotalAmount(order.getTotalAmount());
        dto.setOrderStatus(order.getOrderStatus());

        // Safely get related data
        dto.setCustomerId(order.getAccount() != null ? order.getAccount().getId() : null);
        dto.setReceiverFullName(order.getReceiverFullName());
        dto.setReceiverPhoneNumber(order.getReceiverPhoneNumber());
        dto.setFullShippingAddress(order.getFullShippingAddress());
        dto.setShippingMethodName(order.getShippingMethod() != null ? order.getShippingMethod().getMethodName() : "N/A");

        return dto;
    }
}