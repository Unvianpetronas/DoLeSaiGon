package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.CheckoutRequestDTO;
import com.example.Doanlesg.dto.OrderTotalDTO;
import com.example.Doanlesg.model.Order;
import com.example.Doanlesg.services.OrderService;
import com.example.Doanlesg.services.QRCodeManagermentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/api/ver0.0.1/orders")
public class OrderChecker {

    private final QRCodeManagermentService qrCodeManagerService;
    private final OrderService orderService;
    private static final org.slf4j.Logger log = org.slf4j.LoggerFactory.getLogger(OrderChecker.class);


    public OrderChecker(QRCodeManagermentService qrCodeManagerService, OrderService orderService) {
        this.qrCodeManagerService = qrCodeManagerService;
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<QRCodeManagermentService.PaymentInfo> createPaymentQrCode(@RequestBody CheckoutRequestDTO request) {
        log.info("=== CREATE PAYMENT QR CODE ===");
        log.debug("Received checkout request: {}", request);

        OrderTotalDTO total = orderService.calculateTotal(request);
        log.debug("Calculated total amount: {} for user id: {}", total.getTotalAmount(), request.getCustomerId());

        QRCodeManagermentService.PaymentInfo paymentInfo;
        try {
            if (request.getPaymentMethodId() == 1) {
                log.info("Using Payment Method ID 1 – generating track code");
                paymentInfo = qrCodeManagerService.trackCode(total.getTotalAmount());
            } else {
                log.info("Using default payment method – fetching payment info");
                paymentInfo = qrCodeManagerService.getPaymentInfo();
            }

            if (paymentInfo != null) {
                log.debug("Placing order with unique code: {}", paymentInfo.uniqueCode());
                orderService.placeOrder(request, paymentInfo.uniqueCode());
                // orderService.processPaidOrder(paymentInfo.uniqueCode(), request.getPaymentMethodId() == 1);
                log.info("Order placed successfully for user id: {} with unique code: {}", request.getCustomerId(),
                        paymentInfo.uniqueCode());
            } else {
                log.warn("Received null PaymentInfo from QRCodeManagermentService");
            }
        } catch (Exception e) {
            log.error("Failed to create payment QR code for user id: {} – {}", request.getCustomerId(), e.getMessage(), e);
            throw new NumberFormatException("Place Order Failed.");
        }

        log.info("=== END CREATE PAYMENT QR CODE ===");
        return ResponseEntity.ok(paymentInfo);
    }

    @GetMapping("/status/{uniqueCode}")
    public ResponseEntity<Map<String, String>> getOrderStatus(@PathVariable String uniqueCode) {
        log.info("=== GET ORDER STATUS for code: {} ===", uniqueCode);

        Optional<Order> order = orderService.findOrderByPaymentCode(uniqueCode);
        if (order.isEmpty()) {
            log.warn("No order found with payment code: {}", uniqueCode);
            return ResponseEntity.notFound().build();
        }

        Map<String, String> response = new HashMap<>();
        response.put("status", order.get().getOrderStatus());

        log.debug("Order status for code {}: {}", uniqueCode, order.get().getOrderStatus());
        log.info("=== END GET ORDER STATUS ===");
        return ResponseEntity.ok(response);
    }
}
