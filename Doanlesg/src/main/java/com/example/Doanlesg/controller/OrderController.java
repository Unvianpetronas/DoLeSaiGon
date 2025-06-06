package com.example.Doanlesg.controller;

import com.example.Doanlesg.services.QRCodeManagermentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final QRCodeManagermentService qrCodeManagerService;

    public OrderController(QRCodeManagermentService qrCodeManagerService) {
        this.qrCodeManagerService = qrCodeManagerService;
    }

    @PostMapping
    public ResponseEntity<QRCodeManagermentService.PaymentInfo> createPaymentQrCode(@RequestBody CreateOrderRequest request) {
        if (request.amount <= 0) {
            return ResponseEntity.badRequest().build();
        }
        QRCodeManagermentService.PaymentInfo paymentInfo = qrCodeManagerService.generateAndTrackCode(request.amount);
        return ResponseEntity.ok(paymentInfo);
    }

    // DTO cho request body
    public static class CreateOrderRequest {
        public long amount;
    }
}
