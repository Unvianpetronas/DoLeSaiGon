package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.CheckoutRequestDTO;
import com.example.Doanlesg.dto.OrderTotalDTO;
import com.example.Doanlesg.services.OrderService;
import com.example.Doanlesg.services.QRCodeManagermentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;


@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/ver0.0.1/orders")
public class OrderController {

    private final QRCodeManagermentService qrCodeManagerService;
    private final OrderService orderService;

    public OrderController(QRCodeManagermentService qrCodeManagerService, OrderService orderService) {
        this.qrCodeManagerService = qrCodeManagerService;
        this.orderService = orderService;
    }

    @PostMapping
    public ResponseEntity<QRCodeManagermentService.PaymentInfo> createPaymentQrCode(@RequestBody CheckoutRequestDTO request) {
        OrderTotalDTO total = orderService.calculateTotal(request);
        QRCodeManagermentService.PaymentInfo paymentInfo = qrCodeManagerService.generateAndTrackCode(total.getTotalAmount());
        if(paymentInfo != null) {
            orderService.placeOrder(request);
        }
        return ResponseEntity.ok(paymentInfo);
    }
    @PostMapping("/total")
    public ResponseEntity<OrderTotalDTO> calculateOrderTotal(@RequestBody CheckoutRequestDTO request) {
        OrderTotalDTO total = orderService.calculateTotal(request);
        return ResponseEntity.ok(total);
    }


}
