package com.example.Doanlesg.repository;

import com.example.Doanlesg.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long> {
    @Query("SELECT a FROM Product a WHERE a.category =: id")
    List<Product> findByCategoryID(Long id);
@Query("SELECT p FROM Product p WHERE p.productName LIKE  %:name%")
    List<Product> sreachByname(String name);
}
