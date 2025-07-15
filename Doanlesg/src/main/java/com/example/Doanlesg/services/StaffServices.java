package com.example.Doanlesg.services;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.example.Doanlesg.dto.OrderManagementDTO;
import com.example.Doanlesg.dto.OrderSummaryDTO;
import com.example.Doanlesg.dto.ProductDTO;
import com.example.Doanlesg.model.Category;
import com.example.Doanlesg.model.Product;
import com.example.Doanlesg.model.Order;
import com.example.Doanlesg.repository.CategoryRepository;
import com.example.Doanlesg.repository.ProductRepository;
import com.example.Doanlesg.repository.OrderRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StaffServices {

    private final ProductRepository productRepository;

    private final OrderRepository orderRepository;

    private final CategoryRepository categoryRepository;

    private final Cloudinary  cloudinary;

    public StaffServices(OrderRepository orderRepository, ProductRepository productRepository, CategoryRepository categoryRepository, Cloudinary cloudinary) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.cloudinary = cloudinary;
    }

    // Create a new product
    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    // Get all products
    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    // Update existing product - same for both staff and admin
    @Transactional
    public Optional<Product> updateProduct(Long productId, ProductDTO updatedProductDTO, MultipartFile image) {
        // Find the existing product by its ID
        return productRepository.findById(productId).map(product -> {
            // Update fields from the DTO
            product.setProductName(updatedProductDTO.getProductName());
            product.setPrice(updatedProductDTO.getPrice());
            product.setShortDescription(updatedProductDTO.getShortDescription());
            product.setDetailDescription(updatedProductDTO.getDetailDescription());
            product.setStockQuantity(updatedProductDTO.getStockQuantity());
            product.setStatus(updatedProductDTO.getStockQuantity() > 0);

            if (image != null && !image.isEmpty()) {
                try {
                    var options = ObjectUtils.asMap(
                            "public_id", String.valueOf(productId),
                            "overwrite", true,
                            "resource_type", "image"
                    );

                    cloudinary.uploader().upload(image.getBytes(), options);
                } catch (IOException e) {
                    throw new RuntimeException("Could not upload image for product " + productId, e);
                }
            }

            // Handle the category relationship
            if (updatedProductDTO.getCategory() != null && updatedProductDTO.getCategory().getId() != null) {
                Category category = categoryRepository.findById(updatedProductDTO.getCategory().getId())
                        .orElseThrow(() -> new RuntimeException("Category not found with id: " + updatedProductDTO.getCategory().getId()));
                product.setCategory(category);
            }

            // The product with updated fields (including the new image URL) is returned.
            // @Transactional will handle saving the changes.
            return product;
        });
    }

    @Transactional // Makes the method a single transaction
    public Product createProductWithImage(ProductDTO productDTO, MultipartFile imageFile) throws IOException {
        // Step 1: Convert DTO to an entity
        Product product = new Product();
        // Map all fields from the DTO to the entity
        product.setProductName(productDTO.getProductName());
        product.setPrice(productDTO.getPrice());
        product.setShortDescription(productDTO.getShortDescription());
        product.setDetailDescription(productDTO.getDetailDescription());
        product.setStockQuantity(productDTO.getStockQuantity());
        product.setStatus(productDTO.getStockQuantity() > 0);

        if (productDTO.getCategory() != null && productDTO.getCategory().getId() != null) {
            Category category = categoryRepository.findById(productDTO.getCategory().getId())
                    .orElseThrow(() -> new RuntimeException("Category not found with id: " + productDTO.getCategory().getId()));
            product.setCategory(category);
        }

        product.setCreatedAt(LocalDateTime.now());
        // ... map other fields ...

        // Step 2: Save the entity to the database FIRST to generate its ID
        Product savedProduct = productRepository.save(product);

        // Step 3: Use the ID from the saved product to upload the image
        if (imageFile != null && !imageFile.isEmpty()) {
            var options = ObjectUtils.asMap(
                    "public_id", String.valueOf(savedProduct.getId()),
                    "overwrite", true,
                    "resource_type", "image"
            );
            // This will throw an IOException if it fails, which the controller will catch
            cloudinary.uploader().upload(imageFile.getBytes(), options);
        }

        // Return the final, saved product
        return savedProduct;
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

    @Transactional(readOnly = true)
    public List<OrderManagementDTO> getAllOrdersForManagement() {
        return orderRepository.findAllByOrderByOrderDateDesc().stream()
                .map((Object order) -> OrderManagementDTO.fromEntity((Order) order))
                .toList();
    }

    /**
     * ✅ This new method handles updating the order status.
     */
    @Transactional
    public boolean updateOrderStatus(Integer orderId, String newStatus) {
        return orderRepository.findById(orderId)
                .map(order -> {
                    order.setOrderStatus(newStatus);
                    // No need to call .save() due to @Transactional
                    return true;
                })
                .orElse(false);
    }
}