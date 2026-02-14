package com.elif.expense_tracker_backend.category;

import com.elif.expense_tracker_backend.transaction.TransactionType;
import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class CategoryResponse {
    private Long id;
    private String name;
    private TransactionType type;
}
