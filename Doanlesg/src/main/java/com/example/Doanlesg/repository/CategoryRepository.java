package com.example.Doanlesg.repository;

import com.example.Doanlesg.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;


import java.util.List;


@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {
    @Query("SELECT a FROM Category a WHERE a.parentCategoryId =: parentCaregoryId")
    List<Category> findCategorySonByFatherID(@Param("parentCategoryId") Long id);

}
