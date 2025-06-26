package com.example.Doanlesg.services;

import com.example.Doanlesg.dto.OrderDTO;
import com.example.Doanlesg.model.Account;
import com.example.Doanlesg.model.Order;
import com.example.Doanlesg.model.Product;
import com.example.Doanlesg.repository.AccountRepository;
import com.example.Doanlesg.repository.OrderRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class OrderService {
    @Autowired
    private OrderRepository orderRepository;
    @Autowired
    private AccountRepository accountRepository;

    public List<Order> getOrders() {
        return orderRepository.findAll();
    }
    public Order save(OrderDTO orderDTO){
        Order orderEntity = ConvertToOrder(orderDTO);
        return orderRepository.save(orderEntity) ;
    }

    public Order ConvertToOrder(OrderDTO order){
        return new Order();
    }


}
