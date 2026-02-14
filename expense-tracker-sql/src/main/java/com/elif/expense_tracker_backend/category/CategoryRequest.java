package com.elif.expense_tracker_backend.category;

import com.elif.expense_tracker_backend.transaction.TransactionType;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CategoryRequest {
    @NotBlank
    private String name;

    @NotNull
    private TransactionType type;
}
