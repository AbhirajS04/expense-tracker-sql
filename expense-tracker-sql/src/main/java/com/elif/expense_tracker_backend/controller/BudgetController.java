package com.elif.expense_tracker_backend.controller;

import com.elif.expense_tracker_backend.budget.Budget;
import com.elif.expense_tracker_backend.budget.BudgetRequest;
import com.elif.expense_tracker_backend.budget.BudgetSummary;
import com.elif.expense_tracker_backend.service.BudgetService;
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
@RequestMapping("/api/budgets")
@SecurityRequirement(name = "BearerAuth")
public class BudgetController {

    private final BudgetService budgetService;

    public BudgetController(BudgetService budgetService) {
        this.budgetService = budgetService;
    }

    @GetMapping
    public ResponseEntity<List<BudgetSummary>> list(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(budgetService.listWithStatus(user));
    }

    @PostMapping
    public ResponseEntity<Budget> create(Authentication authentication, @Valid @RequestBody BudgetRequest request) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(budgetService.create(user, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable Long id) {
        User user = (User) authentication.getPrincipal();
        budgetService.delete(user, id);
        return ResponseEntity.noContent().build();
    }
}
