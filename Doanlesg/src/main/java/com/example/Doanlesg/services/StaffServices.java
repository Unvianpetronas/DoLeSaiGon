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
import java.util.Arrays;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class StaffServices {

    private final ProductRepository productRepository;

    private final OrderRepository orderRepository;

    private final CategoryRepository categoryRepository;

    private EmbeddingService embeddingService;

    private final Cloudinary  cloudinary;

    public StaffServices(OrderRepository orderRepository, ProductRepository productRepository, CategoryRepository categoryRepository, Cloudinary cloudinary) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
        this.cloudinary = cloudinary;
    }

    public Product createProduct(Product product) {
        return productRepository.save(product);
    }

    public List<Product> getAllProducts() {
        return productRepository.findAll();
    }

    @Transactional
    public Optional<Product> updateProduct(Long productId, ProductDTO updatedProductDTO, MultipartFile image) {
        return productRepository.findById(productId).map(product -> {
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

            if (updatedProductDTO.getCategory() != null && updatedProductDTO.getCategory().getId() != null) {
                Category category = categoryRepository.findById(updatedProductDTO.getCategory().getId())
                        .orElseThrow(() -> new RuntimeException("Category not found with id: " + updatedProductDTO.getCategory().getId()));
                product.setCategory(category);
            }

            return product;
        });
    }

    @Transactional
    public Product createProductWithImage(ProductDTO productDTO, MultipartFile imageFile) throws IOException {
        Product product = new Product();
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

        // generate embedding for newly created product
        String text =
                product.getProductName() + " " +
                        (product.getCategory() != null ? product.getCategory().getCategoryName() : "") + " " +
                        product.getShortDescription() + " " +
                        product.getDetailDescription();

        double[] vector = embeddingService.generateEmbedding(text);

        String embedding = Arrays.stream(vector)
                .mapToObj(String::valueOf)
                .collect(Collectors.joining(","));

        product.setEmbedding(embedding);

        Product savedProduct = productRepository.save(product);

        if (imageFile != null && !imageFile.isEmpty()) {
            var options = ObjectUtils.asMap(
                    "public_id", String.valueOf(savedProduct.getId()),
                    "overwrite", true,
                    "resource_type", "image"
            );
            cloudinary.uploader().upload(imageFile.getBytes(), options);
        }

        return savedProduct;
    }

    public void deleteProduct(Long productId) {
        productRepository.deleteById(productId);
    }

    @Transactional(readOnly = true)
    public List<OrderSummaryDTO> getAllOrdersAsSummary() {
        List<Order> orders = orderRepository.findAll();
        return orders.stream()
                .map(this::convertToSummaryDTO)
                .toList();
    }

    private OrderSummaryDTO convertToSummaryDTO(Order order) {
        return new OrderSummaryDTO(
                order.getId(),
                order.getCode(),
                order.getOrderDate(),
                order.getTotalAmount(),
                order.getOrderStatus()
        );
    }

    public List<Order> searchOrders(String keyword) {
        String lowerKeyword = keyword.toLowerCase();
        return orderRepository.findAll().stream()
                .filter(order -> {
                    boolean matchStatus = order.getOrderStatus() != null
                            && order.getOrderStatus().toLowerCase().contains(lowerKeyword);
                    boolean matchName = order.getAccount() != null
                            && order.getAccount().getCustomer() != null
                            && order.getAccount().getCustomer().getFullName() != null
                            && order.getAccount().getCustomer().getFullName().toLowerCase().contains(lowerKeyword);
                    return matchStatus || matchName;
                })
                .toList();
    }

    public Order getOrderDetails(Integer orderId) {
        return orderRepository.findById(orderId).orElse(null);
    }

    public Optional<Product> getProductById(Long id) {
        return productRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public List<OrderManagementDTO> getAllOrdersForManagement() {
        return orderRepository.findAllByOrderByOrderDateDesc().stream()
                .map(OrderManagementDTO::fromEntity)
                .toList();
    }

    @Transactional
    public boolean updateOrderStatus(Integer orderId, String newStatus) {
        return orderRepository.findById(orderId)
                .map(order -> {
                    order.setOrderStatus(newStatus);
                    return true;
                })
                .orElse(false);
    }
}