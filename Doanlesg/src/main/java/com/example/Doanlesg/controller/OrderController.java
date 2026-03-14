package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.OrderDetailDTO;
import com.example.Doanlesg.dto.OrderSummaryDTO;
import com.example.Doanlesg.services.OrderService;
import jakarta.servlet.http.HttpSession;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/ver0.0.1/orders")
public class OrderController {

    private static final Logger logger = LoggerFactory.getLogger(OrderController.class);

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Gets a list of all orders for the currently authenticated user from the session.
     */
    @GetMapping
    public ResponseEntity<List<OrderSummaryDTO>> getUserOrders(HttpSession session) {
        logger.debug("Entering getUserOrders()");

        Long accountId = (Long) session.getAttribute("account_id");
        if (accountId == null) {
            logger.warn("Unauthorized access attempt to /orders – no account_id in session");
            return ResponseEntity.status(401).body(Collections.emptyList());
        }

        try {
            List<OrderSummaryDTO> orders = orderService.findOrdersByAccountId(accountId);
            logger.info("User {} retrieved {} orders", accountId, orders.size());
            return ResponseEntity.ok(orders);
        } catch (Exception e) {
            logger.error("Error retrieving orders for user {}", accountId, e);
            throw new RuntimeException("Failed to fetch user orders", e);
        }
    }

    /**
     * Gets the full details of a single order by its ID,
     * ensuring the user in the session owns the order.
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailDTO> getOrderDetails(@PathVariable Integer orderId, HttpSession session) {
        logger.debug("Entering getOrderDetails() for orderId={}", orderId);

        Long accountId = (Long) session.getAttribute("account_id");
        if (accountId == null) {
            logger.warn("Unauthorized access attempt to /orders/{} – no account_id in session", orderId);
            return ResponseEntity.status(401).build();
        }

        try {
            OrderDetailDTO details = orderService.findOrderDetailsByIdForAccount(orderId, accountId);

            if (details == null) {
                logger.warn("User {} attempted to access non‑existent or unauthorized order {}", accountId, orderId);
                return ResponseEntity.notFound().build();
            }

            logger.info("User {} retrieved details for order {}", accountId, orderId);
            return ResponseEntity.ok(details);

        } catch (Exception e) {
            logger.error("Error retrieving order {} for user {}", orderId, accountId, e);
            throw new RuntimeException("Failed to fetch order details", e);
        }
    }
}
