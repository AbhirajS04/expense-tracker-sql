package com.elif.expense_tracker_backend.service;

import com.elif.expense_tracker_backend.budget.Budget;
import com.elif.expense_tracker_backend.budget.BudgetRequest;
import com.elif.expense_tracker_backend.budget.BudgetSummary;
import com.elif.expense_tracker_backend.repository.BudgetRepository;
import com.elif.expense_tracker_backend.repository.TransactionRepository;
import com.elif.expense_tracker_backend.transaction.TransactionType;
import com.elif.expense_tracker_backend.transaction.Transaction;
import com.elif.expense_tracker_backend.user.User;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class BudgetService {

    private final BudgetRepository budgetRepository;
    private final TransactionRepository transactionRepository;

    public BudgetService(BudgetRepository budgetRepository, TransactionRepository transactionRepository) {
        this.budgetRepository = budgetRepository;
        this.transactionRepository = transactionRepository;
    }

    public Budget create(User user, BudgetRequest request) {
        budgetRepository.findByUserIdAndCategoryIgnoreCaseAndMonth(user.getId(), request.getCategory(), request.getMonth())
                .ifPresent(existing -> {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Budget already exists for this category/month");
                });

        Budget budget = Budget.builder()
                .user(user)
                .category(request.getCategory())
                .month(request.getMonth())
                .limitAmount(request.getLimitAmount())
                .warningThreshold(request.getWarningThreshold())
                .build();
        return budgetRepository.save(budget);
    }

    public List<BudgetSummary> listWithStatus(User user) {
        List<Budget> budgets = budgetRepository.findByUserId(user.getId());
        return budgets.stream()
                .map(budget -> {
                    YearMonth ym = YearMonth.parse(budget.getMonth());
                    LocalDate start = ym.atDay(1);
                    LocalDate end = ym.atEndOfMonth();
                    Specification<com.elif.expense_tracker_backend.transaction.Transaction> spec =
                            (root, query, cb) -> cb.equal(root.get("user").get("id"), user.getId());
                    spec = spec.and((root, query, cb) -> cb.between(root.get("transactionDate"), start, end));
                    spec = spec.and((root, query, cb) -> cb.equal(
                            cb.lower(root.get("category").get("name")), budget.getCategory().toLowerCase()
                    ));

                    List<com.elif.expense_tracker_backend.transaction.Transaction> txs = transactionRepository.findAll(spec);
                    BigDecimal spent = txs.stream()
                            .filter(tx -> tx.getType() == TransactionType.EXPENSE)
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);

                    double utilization = budget.getLimitAmount().doubleValue() == 0
                            ? 0
                            : spent.doubleValue() / budget.getLimitAmount().doubleValue();
                    boolean exceeded = spent.compareTo(budget.getLimitAmount()) > 0;
                    boolean nearLimit = utilization >= budget.getWarningThreshold() && !exceeded;

                    return BudgetSummary.builder()
                            .id(budget.getId())
                            .category(budget.getCategory())
                            .month(budget.getMonth())
                            .limitAmount(budget.getLimitAmount())
                            .warningThreshold(budget.getWarningThreshold())
                            .spent(spent)
                            .utilization(utilization)
                            .exceeded(exceeded)
                            .nearLimit(nearLimit)
                            .build();
                })
                .toList();
    }

    public void delete(User user, Long id) {
        Budget budget = budgetRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Budget not found"));
        if (!budget.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your budget");
        }
        budgetRepository.delete(budget);
    }
}
