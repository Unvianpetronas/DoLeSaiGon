package com.example.Doanlesg.services;

import com.example.Doanlesg.dto.OrderSummaryDTO;
import com.example.Doanlesg.model.Product;
import com.example.Doanlesg.model.Order;
import com.example.Doanlesg.repository.ProductRepository;
import com.example.Doanlesg.repository.OrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

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

    // Update existing product - same for both staff and admin
    public Optional<Product> updateProduct(Long productId, Product updatedProduct) {
        return productRepository.findById(productId).map(product -> {
            product.setProductName(updatedProduct.getProductName());
            product.setPrice(updatedProduct.getPrice());
            product.setCategory(updatedProduct.getCategory());
            product.setShortDescription(updatedProduct.getShortDescription());
            product.setDetailDescription(updatedProduct.getDetailDescription());
            product.setStockQuantity(updatedProduct.getStockQuantity());
            product.setStatus(updatedProduct.isStatus());

            return productRepository.save(product);
        });
    }

    // Delete product (restricted to admins)
    public void deleteProduct(Long productId) {
        productRepository.deleteById(productId);
    }

    // Retrieve all orders
    @Transactional(readOnly = true) // Good practice for read operations
    public List<OrderSummaryDTO> getAllOrdersAsSummary() {
        List<Order> orders = orderRepository.findAll(); // Fetch all orders

        // Convert the list of Order entities into a list of OrderSummaryDTOs
        return orders.stream()
                .map(this::convertToSummaryDTO)
                .toList();
    }

    // Helper method to perform the conversion
    private OrderSummaryDTO convertToSummaryDTO(Order order) {
        return new OrderSummaryDTO(
                order.getId(),
                order.getCode(),
                order.getOrderDate(),
                order.getTotalAmount(),
                order.getOrderStatus()
        );
    }

    // Search orders by order status or customer name
    public List<Order> searchOrders(String keyword) {
        return orderRepository.findAll().stream()
                .filter(order -> order.getOrderStatus().toLowerCase().contains(keyword.toLowerCase())
                        || order.getAccount().getCustomer().getFullName().toLowerCase().contains(keyword.toLowerCase()))
                .toList();
    }

    // Get order details by ID
    public Order getOrderDetails(Integer orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    // Find product by ID
    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }
}