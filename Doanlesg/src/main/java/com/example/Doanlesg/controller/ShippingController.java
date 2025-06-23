package com.example.Doanlesg.controller;

import com.example.Doanlesg.model.ShippingMethod;
import com.example.Doanlesg.services.ShippingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/shipping")
public class ShippingController {
    @Autowired
    private ShippingService shippingService;

    @GetMapping
    public ResponseEntity<List<ShippingMethod>> getShipping(){
        List<ShippingMethod> shippingMethods = shippingService.getAllShipping();
        return ResponseEntity.ok(shippingMethods);
    }
}
