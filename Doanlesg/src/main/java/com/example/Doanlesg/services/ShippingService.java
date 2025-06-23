package com.example.Doanlesg.services;

import com.example.Doanlesg.model.ShippingMethod;
import com.example.Doanlesg.repository.ProductRepository;
import com.example.Doanlesg.repository.ShippingRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class ShippingService {
    @Autowired
    private ShippingRepository shippingRepository;
    public List<ShippingMethod> getAllShipping(){
        return shippingRepository.findAll();
    }
}
