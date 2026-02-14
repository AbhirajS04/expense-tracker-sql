package com.elif.expense_tracker_backend.service;

import com.elif.expense_tracker_backend.recurring.RecurrenceFrequency;
import com.elif.expense_tracker_backend.recurring.RecurringPayment;
import com.elif.expense_tracker_backend.recurring.RecurringPaymentRequest;
import com.elif.expense_tracker_backend.repository.RecurringPaymentRepository;
import com.elif.expense_tracker_backend.repository.TransactionRepository;
import com.elif.expense_tracker_backend.repository.CategoryRepository;
import com.elif.expense_tracker_backend.transaction.Transaction;
import com.elif.expense_tracker_backend.transaction.TransactionType;
import com.elif.expense_tracker_backend.user.User;
import org.springframework.http.HttpStatus;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@Service
public class RecurringPaymentService {

    private final RecurringPaymentRepository recurringPaymentRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public RecurringPaymentService(RecurringPaymentRepository recurringPaymentRepository, TransactionRepository transactionRepository, CategoryRepository categoryRepository) {
        this.recurringPaymentRepository = recurringPaymentRepository;
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<RecurringPayment> list(User user) {
        return recurringPaymentRepository.findByUserId(user.getId());
    }

    public RecurringPayment create(User user, RecurringPaymentRequest request) {
        var category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        if (!category.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your category");
        }

        RecurringPayment payment = RecurringPayment.builder()
                .user(user)
                .type(request.getType())
                .category(category)
                .amount(request.getAmount())
                .note(request.getNote())
                .frequency(request.getFrequency())
                .nextRun(request.getNextRun())
                .active(Boolean.TRUE.equals(request.getActive()))
                .build();
        return recurringPaymentRepository.save(payment);
    }

    public void delete(User user, Long id) {
        RecurringPayment payment = recurringPaymentRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Recurring payment not found"));
        if (!payment.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your recurring payment");
        }
        recurringPaymentRepository.delete(payment);
    }

    @Scheduled(cron = "0 0 3 * * *")
    @Transactional
    public void processDuePayments() {
        LocalDate today = LocalDate.now();
        List<RecurringPayment> duePayments = recurringPaymentRepository.findByActiveTrueAndNextRunLessThanEqual(today);

        for (RecurringPayment payment : duePayments) {
            Transaction transaction = Transaction.builder()
                    .user(payment.getUser())
                    .type(payment.getType())
                    .category(payment.getCategory())
                    .amount(payment.getAmount())
                    .note(payment.getNote())
                    .transactionDate(payment.getNextRun())
                    .build();
            transactionRepository.save(transaction);

            payment.setNextRun(calculateNextRun(payment.getNextRun(), payment.getFrequency()));
            recurringPaymentRepository.save(payment);
        }
    }

    private LocalDate calculateNextRun(LocalDate current, RecurrenceFrequency frequency) {
        return switch (frequency) {
            case DAILY -> current.plusDays(1);
            case WEEKLY -> current.plusWeeks(1);
            case MONTHLY -> current.plusMonths(1);
        };
    }
}
