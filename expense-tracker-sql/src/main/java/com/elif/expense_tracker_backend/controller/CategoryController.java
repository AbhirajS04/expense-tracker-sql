package com.elif.expense_tracker_backend.controller;

import com.elif.expense_tracker_backend.category.CategoryRequest;
import com.elif.expense_tracker_backend.category.CategoryResponse;
import com.elif.expense_tracker_backend.service.CategoryService;
import com.elif.expense_tracker_backend.user.User;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/categories")
@SecurityRequirement(name = "BearerAuth")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    @GetMapping
    public ResponseEntity<List<CategoryResponse>> list(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(categoryService.list(user));
    }

    @PostMapping
    public ResponseEntity<CategoryResponse> create(Authentication authentication,
                                                   @Valid @RequestBody CategoryRequest request) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(categoryService.create(user, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable Long id) {
        User user = (User) authentication.getPrincipal();
        categoryService.delete(user, id);
        return ResponseEntity.noContent().build();
    }
}
