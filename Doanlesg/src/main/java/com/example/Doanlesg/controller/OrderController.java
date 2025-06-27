package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.CheckoutRequestDTO;
import com.example.Doanlesg.dto.OrderTotalDTO;
import com.example.Doanlesg.model.Order;
import com.example.Doanlesg.repository.OrderRepository;
import com.example.Doanlesg.services.OrderService;
import com.example.Doanlesg.services.QRCodeManagermentService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

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
        Order createdOrder = orderService.placeOrder(request);
        QRCodeManagermentService.PaymentInfo paymentInfo = qrCodeManagerService.generateAndTrackCode(createdOrder.getTotalAmount());
        BigDecimal amount = createdOrder.getTotalAmount();
        return ResponseEntity.ok(paymentInfo);
    }
    @PostMapping("/calculate-total")
    public ResponseEntity<OrderTotalDTO> calculateOrderTotal(@RequestBody CheckoutRequestDTO request) {
        OrderTotalDTO total = orderService.calculateTotal(request);
        return ResponseEntity.ok(total);
    }


}
