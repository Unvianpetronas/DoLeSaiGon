package com.example.Doanlesg.services;

import com.example.Doanlesg.dto.CategoryDTO;
import com.example.Doanlesg.model.Category;
import com.example.Doanlesg.repository.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryService {

    private CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    private CategoryDTO convertToDto(Category category) {
        CategoryDTO dto = new CategoryDTO();
        dto.setId(category.getId());
        dto.setCategoryName(category.getCategoryName());
        return dto;
    }


    @Transactional(readOnly = true)
    public List<CategoryDTO> getAll() {
        List<Category> categories = categoryRepository.findAll();

        return categories.stream()
                .map(this::convertToDto)
                .collect(Collectors.toList());
    }
}
