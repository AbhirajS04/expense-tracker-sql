package com.elif.expense_tracker_backend.controller;

import com.elif.expense_tracker_backend.report.CategoryReportItem;
import com.elif.expense_tracker_backend.report.MonthlyReportItem;
import com.elif.expense_tracker_backend.service.ReportService;
import com.elif.expense_tracker_backend.user.User;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@SecurityRequirement(name = "BearerAuth")
public class ReportController {

    private final ReportService reportService;

    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/monthly")
    public ResponseEntity<List<MonthlyReportItem>> monthly(Authentication authentication,
                                                           @RequestParam(value = "months", defaultValue = "6") int months) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(reportService.monthly(user, months));
    }

    @GetMapping("/category")
    public ResponseEntity<List<CategoryReportItem>> category(Authentication authentication,
                                                             @RequestParam(value = "month", required = false) String month) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(reportService.byCategory(user, month));
    }

    @GetMapping("/spending-trend")
    public ResponseEntity<List<MonthlyReportItem>> trend(Authentication authentication,
                                                         @RequestParam(value = "months", defaultValue = "6") int months) {
        User user = (User) authentication.getPrincipal();
        return ResponseEntity.ok(reportService.spendingTrend(user, months));
    }
}
