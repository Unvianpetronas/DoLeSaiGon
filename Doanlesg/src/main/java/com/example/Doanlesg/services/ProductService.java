package com.example.Doanlesg.services;

import com.example.Doanlesg.model.Product;
import com.example.Doanlesg.repository.CategoryRepository;
import com.example.Doanlesg.repository.ProductRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
public class ProductService {
    private final ProductRepository productRepository;
    private final CategoryRepository categoryRepository;

    public ProductService(ProductRepository productRepository, CategoryRepository categoryRepository) {
        this.productRepository = productRepository;
        this.categoryRepository = categoryRepository;
    }

    @Transactional(readOnly = true)
    public Page<Product> findAll(Pageable pageable) {
        // Chỉ cần truyền thẳng pageable xuống repository
        return productRepository.findAll(pageable);
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
    public List<Product> searchByName(String keyword){
        return productRepository.sreachByname(keyword);
    }
}