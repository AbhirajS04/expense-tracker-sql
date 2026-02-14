package com.elif.expense_tracker_backend.report;

import lombok.AllArgsConstructor;
import lombok.Getter;

import java.math.BigDecimal;

@Getter
@AllArgsConstructor
public class MonthlyReportItem {
    private String month;
    private BigDecimal total;
}
