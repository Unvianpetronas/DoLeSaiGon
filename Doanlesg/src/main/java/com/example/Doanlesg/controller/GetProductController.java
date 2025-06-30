package com.example.Doanlesg.controller;

import com.example.Doanlesg.dto.ProductDTO;
import com.example.Doanlesg.services.ProductService;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ver0.0.1/product")// React dev server
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
    public ResponseEntity <Page<ProductDTO>> getAllProductsByName(@RequestParam ("keyword") String keywork,
                                                            @RequestParam("page") int page,
                                                            @RequestParam( "size") int size,
                                                            @RequestParam( "sort") String sortBy){
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<ProductDTO> productDTOS = productService.searchByName(keywork, pageable);
        return ResponseEntity.ok(productDTOS);
    }

    @GetMapping("/categoryID")
    public ResponseEntity<Page<ProductDTO>> getAllProductsByCategory(@RequestParam ("categoryID")Long id,
                                                                     @RequestParam("page") int page,
                                                                     @RequestParam( "size") int size,
                                                                     @RequestParam( "sort") String sortBy){
        Pageable pageable = PageRequest.of(page, size, Sort.by(sortBy));
        Page<ProductDTO> productDTOPage = productService.findByCategory(id, pageable);
        return ResponseEntity.ok(productDTOPage);
    }
    @GetMapping("/productID")
    public ResponseEntity<ProductDTO> getProduct(@RequestParam("id") Long id ){
        ProductDTO productDTO = productService.findById(id);
        return  ResponseEntity.ok(productDTO);
    }

}
