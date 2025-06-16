package com.example.Doanlesg.services;

import com.example.Doanlesg.model.Product;
import com.example.Doanlesg.model.Order;
import com.example.Doanlesg.repository.ProductRepository;
import com.example.Doanlesg.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class StaffServices {

    @Autowired
    private ProductRepository productRepository;

    @Autowired
    private OrderRepository orderRepository;

    // Create a new product
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    // Get all products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Update existing product
    public Optional<Product> updateProduct(Long productId, Product updatedProduct) {
        return productRepository.findById(productId).map(product -> {
            product.setProductName(updatedProduct.getProductName());
            product.setPrice(updatedProduct.getPrice());
            product.setCategory(updatedProduct.getCategory());
            return productRepository.save(product);
        });
    }

    // Delete product (restricted to admins)
    public void deleteProduct(Long productId) {
        productRepository.deleteById(productId);
    }

    // Retrieve all orders
    public List<Order> getAllOrders() {
        return orderRepository.findAll();
    }

    // Search orders by order status or customer name
    public List<Order> searchOrders(String keyword) {
        return orderRepository.findAll().stream()
                .filter(order -> order.getOrderStatus().toLowerCase().contains(keyword.toLowerCase())
                        || order.getCustomer().getFullName().toLowerCase().contains(keyword.toLowerCase()))
                .toList();
    }

    // Get order details by ID
    public Order getOrderDetails(Integer orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }
}