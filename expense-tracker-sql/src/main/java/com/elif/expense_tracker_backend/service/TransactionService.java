package com.elif.expense_tracker_backend.service;

import com.elif.expense_tracker_backend.category.Category;
import com.elif.expense_tracker_backend.repository.CategoryRepository;
import com.elif.expense_tracker_backend.repository.TransactionRepository;
import com.elif.expense_tracker_backend.transaction.Transaction;
import com.elif.expense_tracker_backend.transaction.TransactionRequest;
import com.elif.expense_tracker_backend.transaction.TransactionResponse;
import com.elif.expense_tracker_backend.transaction.TransactionType;
import com.elif.expense_tracker_backend.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;

@Service
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    public TransactionService(TransactionRepository transactionRepository, CategoryRepository categoryRepository) {
        this.transactionRepository = transactionRepository;
        this.categoryRepository = categoryRepository;
    }

    public Page<TransactionResponse> list(User user,
                                          TransactionType type,
                                          Long categoryId,
                                          String month,
                                          Pageable pageable) {
        Specification<Transaction> spec = baseSpec(user.getId());

        if (type != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("type"), type));
        }

        if (categoryId != null) {
            spec = spec.and((root, query, cb) -> cb.equal(root.get("category").get("id"), categoryId));
        }

        if (month != null) {
            YearMonth yearMonth = YearMonth.parse(month);
            LocalDate start = yearMonth.atDay(1);
            LocalDate end = yearMonth.atEndOfMonth();
            spec = spec.and((root, query, cb) -> cb.between(root.get("transactionDate"), start, end));
        }

        return transactionRepository.findAll(spec, pageable)
                .map(this::toResponse);
    }

    public Transaction create(User user, TransactionRequest request) {
        Category category = getOwnedCategory(user, request.getCategoryId());
        Transaction transaction = Transaction.builder()
                .user(user)
                .type(request.getType())
                .category(category)
                .amount(request.getAmount())
                .note(request.getNote())
                .transactionDate(request.getTransactionDate())
                .build();
        return transactionRepository.save(transaction);
    }

    public Transaction update(User user, Long id, TransactionRequest request) {
        Transaction existing = getOwnedTransaction(user, id);
        Category category = getOwnedCategory(user, request.getCategoryId());
        existing.setType(request.getType());
        existing.setCategory(category);
        existing.setAmount(request.getAmount());
        existing.setNote(request.getNote());
        existing.setTransactionDate(request.getTransactionDate());
        return transactionRepository.save(existing);
    }

    public void delete(User user, Long id) {
        Transaction existing = getOwnedTransaction(user, id);
        transactionRepository.delete(existing);
    }

    public List<Transaction> findByMonth(User user, YearMonth month) {
        LocalDate start = month.atDay(1);
        LocalDate end = month.atEndOfMonth();
        Specification<Transaction> spec = baseSpec(user.getId())
                .and((root, query, cb) -> cb.between(root.get("transactionDate"), start, end));
        return transactionRepository.findAll(spec);
    }

    private Transaction getOwnedTransaction(User user, Long id) {
        Transaction tx = transactionRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Transaction not found"));
        if (!tx.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your transaction");
        }
        return tx;
    }

    private Category getOwnedCategory(User user, Long categoryId) {
        Category category = categoryRepository.findById(categoryId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Category not found"));
        if (!category.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your category");
        }
        return category;
    }

    public TransactionResponse toResponse(Transaction tx) {
        return TransactionResponse.builder()
                .id(tx.getId())
                .type(tx.getType())
                .categoryId(tx.getCategory().getId())
                .categoryName(tx.getCategory().getName())
                .amount(tx.getAmount())
                .note(tx.getNote())
                .transactionDate(tx.getTransactionDate())
                .createdAt(tx.getCreatedAt())
                .build();
    }

    private Specification<Transaction> baseSpec(Long userId) {
        return (root, query, cb) -> cb.equal(root.get("user").get("id"), userId);
    }
}
