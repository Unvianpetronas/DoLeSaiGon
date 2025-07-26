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

    public OrderChecker(QRCodeManagermentService qrCodeManagerService, OrderService orderService) {
        this.qrCodeManagerService = qrCodeManagerService;
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<QRCodeManagermentService.PaymentInfo> createPaymentQrCode(@RequestBody CheckoutRequestDTO request) {
        OrderTotalDTO total = orderService.calculateTotal(request);
        QRCodeManagermentService.PaymentInfo paymentInfo;

            try {
                if (request.getPaymentMethodId() == 1) {
                    paymentInfo = qrCodeManagerService.trackCode(total.getTotalAmount());
                } else {
                    paymentInfo = qrCodeManagerService.getPaymentInfo();
                }
                if (paymentInfo != null) {
                    orderService.placeOrder(request, paymentInfo.uniqueCode());
                    orderService.processPaidOrder(paymentInfo.uniqueCode(), request.getPaymentMethodId() == 1);
                }
            } catch (Exception e) {
                throw new NumberFormatException("Place Order Failed.");
            }

        return ResponseEntity.ok(paymentInfo);
    }

    @GetMapping("/status/{uniqueCode}")
    public ResponseEntity<Map<String, String>> getOrderStatus(@PathVariable String uniqueCode) {
        Optional<Order> order = orderService.findOrderByPaymentCode(uniqueCode);

        if (order.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Map<String, String> response = new HashMap<>();
        response.put("status", order.get().getOrderStatus());

        return ResponseEntity.ok(response);
    }
}
