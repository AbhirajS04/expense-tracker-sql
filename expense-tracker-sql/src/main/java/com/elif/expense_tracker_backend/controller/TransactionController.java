package com.elif.expense_tracker_backend.controller;

import com.elif.expense_tracker_backend.service.TransactionService;
import com.elif.expense_tracker_backend.transaction.TransactionRequest;
import com.elif.expense_tracker_backend.transaction.TransactionResponse;
import com.elif.expense_tracker_backend.transaction.TransactionType;
import com.elif.expense_tracker_backend.user.User;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springdoc.core.annotations.ParameterObject;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/transactions")
@SecurityRequirement(name = "BearerAuth")
public class TransactionController {

    private final TransactionService transactionService;

    public TransactionController(TransactionService transactionService) {
        this.transactionService = transactionService;
    }

    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> list(Authentication authentication,
                                                          @RequestParam(value = "type", required = false) TransactionType type,
                                                          @RequestParam(value = "categoryId", required = false) Long categoryId,
                                                          @RequestParam(value = "month", required = false) String month,
                                                          @ParameterObject Pageable pageable) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(transactionService.list(user, type, categoryId, month, pageable));
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> create(Authentication authentication,
                                                      @Valid @RequestBody TransactionRequest request) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(transactionService.toResponse(transactionService.create(user, request)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> update(Authentication authentication,
                                                      @PathVariable Long id,
                                                      @Valid @RequestBody TransactionRequest request) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(transactionService.toResponse(transactionService.update(user, id, request)));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(Authentication authentication, @PathVariable Long id) {
        User user = (User) authentication.getPrincipal();
        transactionService.delete(user, id);
        return ResponseEntity.noContent().build();
    }
}
