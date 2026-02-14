package com.elif.expense_tracker_backend.repository;

import com.elif.expense_tracker_backend.budget.Budget;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BudgetRepository extends JpaRepository<Budget, Long> {
    List<Budget> findByUserId(Long userId);
    Optional<Budget> findByUserIdAndCategoryIgnoreCaseAndMonth(Long userId, String category, String month);
}
