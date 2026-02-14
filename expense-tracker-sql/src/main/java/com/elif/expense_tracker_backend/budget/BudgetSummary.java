package com.elif.expense_tracker_backend.budget;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@Builder
@AllArgsConstructor
public class BudgetSummary {
    private Long id;
    private String category;
    private String month;
    private BigDecimal limitAmount;
    private Double warningThreshold;
    private BigDecimal spent;
    private double utilization;
    private boolean exceeded;
    private boolean nearLimit;
}
