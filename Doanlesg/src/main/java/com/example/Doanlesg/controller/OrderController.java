package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.OrderDetailDTO;
import com.example.Doanlesg.dto.OrderSummaryDTO;
import com.example.Doanlesg.services.OrderService;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;


@RestController
@RequestMapping("/api/ver0.0.1/orders")
@CrossOrigin(origins = "http://localhost:3000", allowCredentials = "true")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    /**
     * Gets a list of all orders for the currently authenticated user from the session.
     */
    @GetMapping
    public ResponseEntity<List<OrderSummaryDTO>> getUserOrders(HttpSession session) {
        // 2. Get the account ID from the session
        Long accountId = (Long) session.getAttribute("account_id");

        if (accountId == null) {
            // If no user is logged in, return an empty list or a 401 Unauthorized error
            return ResponseEntity.status(401).body(Collections.emptyList());
        }

        List<OrderSummaryDTO> orders = orderService.findOrdersByAccountId(1L);
//        System.out.println(orders);
        return ResponseEntity.ok(orders);
    }

    /**
     * Gets the full details of a single order by its ID,
     * ensuring the user in the session owns the order.
     */
    @GetMapping("/{orderId}")
    public ResponseEntity<OrderDetailDTO> getOrderDetails(@PathVariable Integer orderId, HttpSession session) {
        // 3. Get the account ID from the session
        Long accountId = (Long) session.getAttribute("account_id");

        if (accountId == null) {
            // User is not logged in, they cannot view any order.
            return ResponseEntity.status(401).build();
        }

        // 4. The service layer will now handle checking if this accountId owns the order
        OrderDetailDTO orderDetails = orderService.findOrderDetailsByIdForAccount(orderId, accountId);

        if (orderDetails == null) {
            // This means either the order doesn't exist OR the user doesn't own it.
            // Returning 404 is a safe default.
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(orderDetails);
    }
}