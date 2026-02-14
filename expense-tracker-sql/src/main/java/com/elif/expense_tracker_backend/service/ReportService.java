package com.elif.expense_tracker_backend.service;

import com.elif.expense_tracker_backend.report.CategoryReportItem;
import com.elif.expense_tracker_backend.report.MonthlyReportItem;
import com.elif.expense_tracker_backend.repository.TransactionRepository;
import com.elif.expense_tracker_backend.transaction.TransactionType;
import com.elif.expense_tracker_backend.user.User;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ReportService {

    private final TransactionRepository transactionRepository;

    public ReportService(TransactionRepository transactionRepository) {
        this.transactionRepository = transactionRepository;
    }

    public List<MonthlyReportItem> monthly(User user, int monthsBack) {
        LocalDate today = LocalDate.now();
        LocalDate from = YearMonth.from(today.minusMonths(monthsBack - 1)).atDay(1);
        Specification<com.elif.expense_tracker_backend.transaction.Transaction> spec = (root, query, cb) -> cb.equal(root.get("user").get("id"), user.getId());
        spec = spec.and((root, query, cb) -> cb.between(root.get("transactionDate"), from, today));

        List<com.elif.expense_tracker_backend.transaction.Transaction> txs = transactionRepository.findAll(spec);

        Map<String, BigDecimal> byMonth = txs.stream()
                .filter(tx -> tx.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        tx -> YearMonth.from(tx.getTransactionDate()).toString(),
                        Collectors.reducing(BigDecimal.ZERO, com.elif.expense_tracker_backend.transaction.Transaction::getAmount, BigDecimal::add)
                ));

        return byMonth.entrySet().stream()
                .map(entry -> new MonthlyReportItem(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(MonthlyReportItem::getMonth))
                .toList();
    }

    public List<CategoryReportItem> byCategory(User user, String month) {
        List<com.elif.expense_tracker_backend.transaction.Transaction> txs;
        Specification<com.elif.expense_tracker_backend.transaction.Transaction> spec = (root, query, cb) -> cb.equal(root.get("user").get("id"), user.getId());
        if (month != null) {
            YearMonth ym = YearMonth.parse(month);
            LocalDate start = ym.atDay(1);
            LocalDate end = ym.atEndOfMonth();
            spec = spec.and((root, query, cb) -> cb.between(root.get("transactionDate"), start, end));
        }
        txs = transactionRepository.findAll(spec);

        Map<String, BigDecimal> byCategory = txs.stream()
                .filter(tx -> tx.getType() == TransactionType.EXPENSE)
                .collect(Collectors.groupingBy(
                        tx -> tx.getCategory().getName(),
                        Collectors.reducing(BigDecimal.ZERO, com.elif.expense_tracker_backend.transaction.Transaction::getAmount, BigDecimal::add)
                ));

        return byCategory.entrySet().stream()
                .map(entry -> new CategoryReportItem(entry.getKey(), entry.getValue()))
                .sorted(Comparator.comparing(CategoryReportItem::getCategory))
                .toList();
    }

    public List<MonthlyReportItem> spendingTrend(User user, int monthsBack) {
        return monthly(user, monthsBack);
    }
}
