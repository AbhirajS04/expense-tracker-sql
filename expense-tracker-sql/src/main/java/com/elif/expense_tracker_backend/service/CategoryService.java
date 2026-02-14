package com.elif.expense_tracker_backend.service;

import com.elif.expense_tracker_backend.category.Category;
import com.elif.expense_tracker_backend.category.CategoryRequest;
import com.elif.expense_tracker_backend.category.CategoryResponse;
import com.elif.expense_tracker_backend.repository.CategoryRepository;
import com.elif.expense_tracker_backend.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@Service
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public CategoryService(CategoryRepository categoryRepository) {
        this.categoryRepository = categoryRepository;
    }

    public List<CategoryResponse> list(User user) {
        return categoryRepository.findByUserId(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    public CategoryResponse create(User user, CategoryRequest request) {
        categoryRepository.findByUserIdAndNameIgnoreCase(user.getId(), request.getName())
                .ifPresent(c -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Category already exists");
                });

        Category category = Category.builder()
                .user(user)
                .name(request.getName())
                .type(request.getType())
                .build();
        categoryRepository.save(category);
        return toResponse(category);
    }

    public void delete(User user, Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        if (!category.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your category");
        }
        categoryRepository.delete(category);
    }

    public Category getOwned(User user, Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        if (!category.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your category");
        }
        return category;
    }

    private CategoryResponse toResponse(Category category) {
        return CategoryResponse.builder()
                .id(category.getId())
                .name(category.getName())
                .type(category.getType())
                .build();
    }
}
