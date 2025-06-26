package com.example.Doanlesg.repository;

import com.example.Doanlesg.model.Product;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductRepository extends JpaRepository<Product,Long> {
<<<<<<< frontend
    @Query(value = "SELECT a FROM Product a WHERE a.id =:id")
    Page<Product> findByCategoryID(Long id, Pageable pageable);
=======
    @Query("SELECT a FROM Product a WHERE a.category.id =:id")
    Page<Product> findByCategoryID(Long id,Pageable pageable);
>>>>>>> main

    @Query(value = "SELECT p FROM Product p WHERE p.productName LIKE  %:name%")
    Page<Product> findByKeyWord(String name, Pageable pageable);

}
