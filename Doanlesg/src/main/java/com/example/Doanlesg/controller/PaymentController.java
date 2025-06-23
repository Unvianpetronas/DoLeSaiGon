package com.example.Doanlesg.controller;

import com.example.Doanlesg.model.PaymentMethod;
import com.example.Doanlesg.services.PaymentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("api/medthod")
public class PaymentController {
    @Autowired
    private PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<PaymentMethod>> getAlPayment() {
        List<PaymentMethod> paymentMethods = paymentService.getPaymentMethods();
        return ResponseEntity.ok(paymentMethods);
    }
}
