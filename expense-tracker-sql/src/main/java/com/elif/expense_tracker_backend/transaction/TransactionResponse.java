package com.elif.expense_tracker_backend.transaction;

import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;
import java.time.LocalDate;

@Getter
@Builder
public class TransactionResponse {
    private Long id;
    private TransactionType type;
    private Long categoryId;
    private String categoryName;
    private BigDecimal amount;
    private String note;
    private LocalDate transactionDate;
    private Instant createdAt;
}
