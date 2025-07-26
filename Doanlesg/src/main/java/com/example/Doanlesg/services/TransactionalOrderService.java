package com.example.Doanlesg.services;

import com.example.Doanlesg.model.Order;
import com.example.Doanlesg.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class TransactionalOrderService {

    private final OrderRepository orderRepository;
    private final QRCodeManagermentService qrCodeManager;

    public TransactionalOrderService(OrderRepository orderRepository, QRCodeManagermentService qrCodeManager) {
        this.orderRepository = orderRepository;
        this.qrCodeManager = qrCodeManager;
    }

    @Transactional
    public Order updateOrderStatus(String uniqueCode, boolean flag) {
        Order updatedOrder = orderRepository.findByCode(uniqueCode)
                .orElseThrow(() -> new RuntimeException("Paid order not found with code: " + uniqueCode));

        if ("Paid".equalsIgnoreCase(updatedOrder.getOrderStatus())) {
            // Already paid, just remove from tracking and exit
            qrCodeManager.markAsPaid(uniqueCode);
            return null;
        }

        if (flag)
            updatedOrder.setOrderStatus("Paid");
        else
            updatedOrder.setOrderStatus("Cash");
        orderRepository.save(updatedOrder);
        qrCodeManager.markAsPaid(uniqueCode);

        return updatedOrder;
    }
}
