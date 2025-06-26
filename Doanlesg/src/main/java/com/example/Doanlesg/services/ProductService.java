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
import java.util.NoSuchElementException;
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
        productDTO.setShortdescription(product.getShortDescription());
        productDTO.setDetaildescription(product.getDetailDescription());
        productDTO.setCreatedAt(product.getCreatedAt());
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
    public Page<ProductDTO> findByCategory(Long categoryId, Pageable pageable) {
        Page<Product> productPage = productRepository.findByCategoryID(categoryId,pageable);
        return productPage.map(this::convertToDto);
    }
    @Transactional(readOnly = true)
    public ProductDTO findById(Long id) {
        // Tìm kiếm product trong repository, kết quả trả về là Optional<Product>
        Optional<Product> productOptional = productRepository.findById(id);
        if (productOptional.isPresent()) {
            Product product = productOptional.get();
            return convertToDto(product);
        } else {
            throw new NoSuchElementException("Không tìm thấy sản phẩm với ID: " + id);
        }
    }


    @Transactional(readOnly = true)
    public Page<ProductDTO> searchByName(String keyword, Pageable pageable) {
        Page<Product> productPage =  productRepository.findByKeyWord(keyword, pageable);
        return productPage.map(this::convertToDto);
    }
}