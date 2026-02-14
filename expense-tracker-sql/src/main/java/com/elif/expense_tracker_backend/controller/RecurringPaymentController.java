package com.elif.expense_tracker_backend.controller;

import com.elif.expense_tracker_backend.recurring.RecurringPayment;
import com.elif.expense_tracker_backend.recurring.RecurringPaymentRequest;
import com.elif.expense_tracker_backend.service.RecurringPaymentService;
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
@RequestMapping("/api/recurring")
@SecurityRequirement(name = "BearerAuth")
public class RecurringPaymentController {

    private final RecurringPaymentService recurringPaymentService;

    public RecurringPaymentController(RecurringPaymentService recurringPaymentService) {
        this.recurringPaymentService = recurringPaymentService;
    }

    @GetMapping
    public ResponseEntity<List<RecurringPayment>> list(Authentication authentication) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(recurringPaymentService.list(user));
    }

    @PostMapping
    public ResponseEntity<RecurringPayment> create(Authentication authentication,
                                                   @Valid @RequestBody RecurringPaymentRequest request) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(recurringPaymentService.create(user, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable Long id) {
        User user = (User) authentication.getPrincipal();
        recurringPaymentService.delete(user, id);
        return ResponseEntity.noContent().build();
    }
}
