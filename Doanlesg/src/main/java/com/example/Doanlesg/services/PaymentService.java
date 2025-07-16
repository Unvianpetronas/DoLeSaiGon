package com.example.Doanlesg.services;

import com.example.Doanlesg.model.PaymentMethod;
import com.example.Doanlesg.repository.PaymentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class PaymentService {
    @Autowired
    private PaymentRepository paymentRepository;

    public List<PaymentMethod> getPaymentMethods() {
        return paymentRepository.findAll();
    }


}
