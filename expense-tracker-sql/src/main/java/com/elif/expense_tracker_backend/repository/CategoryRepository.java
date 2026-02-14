package com.elif.expense_tracker_backend.repository;

import com.elif.expense_tracker_backend.category.Category;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface CategoryRepository extends JpaRepository<Category, Long> {
    List<Category> findByUserId(Long userId);
    Optional<Category> findByUserIdAndNameIgnoreCase(Long userId, String name);
}
