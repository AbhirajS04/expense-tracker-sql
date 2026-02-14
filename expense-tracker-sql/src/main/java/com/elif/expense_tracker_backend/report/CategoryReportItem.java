package com.elif.expense_tracker_backend.report;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class CategoryReportItem {
    private String category;
    private BigDecimal total;
}
