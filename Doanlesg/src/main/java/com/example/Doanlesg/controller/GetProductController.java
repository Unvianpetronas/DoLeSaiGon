package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.ProductDTO;
import com.example.Doanlesg.services.ProductService;
import com.example.Doanlesg.services.RecommendationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;

@RestController
@RequestMapping("/api/ver0.0.1/product") // React dev server
public class GetProductController {

    private static final Logger logger = LoggerFactory.getLogger(GetProductController.class);

    private final ProductService productService;
    private final RecommendationService recommendationService;

    public GetProductController(ProductService productService,
                                RecommendationService recommendationService) {
        this.productService = productService;
        this.recommendationService = recommendationService;
    }


    @GetMapping
    public ResponseEntity<Page<ProductDTO>> getAllProducts(
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam("sort") String sortBy) {

        logger.info("GET /product?page={}&size={}&sort={}", page, size, sortBy);

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<ProductDTO> productDtoPage = productService.findAll(pageable);

        logger.debug("Returned {} products (page={}, size={})",
                productDtoPage.getNumberOfElements(), page, size);
        return ResponseEntity.ok(productDtoPage);
    }


    @GetMapping("/productname")
    public ResponseEntity<Page<ProductDTO>> getAllProductsByName(
            @RequestParam("keyword") String keyword,
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam("sort") String sortBy) {

        logger.info("GET /product/productname?keyword={}&page={}&size={}&sort={}",
                keyword, page, size, sortBy);

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<ProductDTO> productDTOS = productService.searchByName(keyword, pageable);

        logger.debug("Search result: {} products found for keyword '{}'",
                productDTOS.getNumberOfElements(), keyword);
        return ResponseEntity.ok(productDTOS);
    }


    @GetMapping("/categoryID")
    public ResponseEntity<Page<ProductDTO>> getAllProductsByCategory(
            @RequestParam("categoryID") Long id,
            @RequestParam("page") int page,
            @RequestParam("size") int size,
            @RequestParam("sort") String sortBy) {

        logger.info("GET /product/categoryID?categoryID={}&page={}&size={}&sort={}",
                id, page, size, sortBy);

        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<ProductDTO> productDTOPage = productService.findByCategory(id, pageable);

        logger.debug("Products in category {}: {} items on page {}",
                id, productDTOPage.getNumberOfElements(), page);
        return ResponseEntity.ok(productDTOPage);
    }


    @GetMapping("/productID")
    public ResponseEntity<ProductDTO> getProduct(@RequestParam("id") Long id) {

        logger.info("GET /product/productID?id={}", id);

        try {
            ProductDTO productDTO = productService.findById(id);
            if (productDTO == null) {
                logger.warn("Product with id {} not found", id);
                return ResponseEntity.notFound().build();
            }
            logger.debug("Returned product details: {}", productDTO.getProductName());
            return ResponseEntity.ok(productDTO);
        } catch (Exception e) {
            logger.error("Error retrieving product with id {}: {}", id, e.toString(), e);
            throw new RuntimeException("Failed to fetch product", e);
        }
    }

    @GetMapping("/recommend/{id}")
    public ResponseEntity<List<ProductDTO>> recommendProducts(@PathVariable Long id) {

        logger.info("GET /product/recommend/{}", id);

        List<ProductDTO> recommendations = recommendationService
                .recommendProducts(id)
                .stream()
                .map(productService::convertToDto)
                .toList();

        return ResponseEntity.ok(recommendations);
    }

}
