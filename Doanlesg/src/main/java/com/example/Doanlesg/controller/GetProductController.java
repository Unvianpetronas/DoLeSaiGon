package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.ProductDTO;
import com.example.Doanlesg.services.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

@CrossOrigin(origins = "http://localhost:3000")
@RestController
@RequestMapping("/api/ver0.0.1/product")
public class GetProductController {
    private ProductService productService;
    public GetProductController(ProductService productService) {
        this.productService = productService;
    }

    @GetMapping
    public ResponseEntity<Page<ProductDTO>> getAllProducts(
            @RequestParam("page") int page,
            @RequestParam( "size") int size,
            @RequestParam( "sort") String sortBy) {
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<ProductDTO> productDtoPage = productService.findAll(pageable); // Service đã trả về DTO
        return ResponseEntity.ok(productDtoPage);
    }
    @GetMapping("/productname")
    public ResponseEntity <Page<ProductDTO>> getAllProductsByName(@RequestParam String keywork,
                                                            @RequestParam("page") int page,
                                                            @RequestParam( "size") int size,
                                                            @RequestParam( "price") String sortBy){
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<ProductDTO> productDTOS = productService.searchByName(keywork, pageable);
        return ResponseEntity.ok(productDTOS);
    }

}
