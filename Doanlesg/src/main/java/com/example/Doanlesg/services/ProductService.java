package com.example.Doanlesg.services;

import com.example.Doanlesg.dto.CartItemDTO;
import com.example.Doanlesg.dto.CategoryDTO;
import com.example.Doanlesg.dto.ProductDTO;
import com.example.Doanlesg.model.CartItem;
import com.example.Doanlesg.model.Category;
import com.example.Doanlesg.model.Product;
import com.example.Doanlesg.repository.CategoryRepository;
import com.example.Doanlesg.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> findAll(Pageable pageable) {
       Page<Product> productPage = productRepository.findAll(pageable);
        return productPage.map(this::convertToDto);
    }
    private ProductDTO convertToDto(Product product) {
        ProductDTO productDTO = new ProductDTO();
        productDTO.setId(product.getId());
        productDTO.setProductName(product.getProductName());
        productDTO.setPrice(product.getPrice());
        productDTO.setStockQuantity(product.getStockQuantity());

        // Chuyển đổi Category Entity lồng trong Product sang CategoryDTO
        if (product.getCategory() != null) {
            CategoryDTO categoryDTO = new CategoryDTO();
            categoryDTO.setId(product.getCategory().getId());
            categoryDTO.setCategoryName(product.getCategory().getCategoryName());
            productDTO.setCategory(categoryDTO);
        }
        return productDTO;
    }

    @Transactional(readOnly = true)
    public List<Product> findByCategory(Long categoryId){
        return productRepository.findByCategoryID(categoryId);
    }

    @Transactional(readOnly = true)
    public Optional<Product> findById(Long id){
        return productRepository.findById(id);
    }

    @Transactional(readOnly = true)
    public Page<ProductDTO> searchByName(String keyword, Pageable pageable) {
        Page<Product> productPage =  productRepository.findByKeyWord(keyword, pageable);
        return productPage.map(this::convertToDto);
    }
}