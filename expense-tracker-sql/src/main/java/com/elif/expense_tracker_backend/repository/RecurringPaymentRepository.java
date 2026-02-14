package com.elif.expense_tracker_backend.repository;

import com.elif.expense_tracker_backend.recurring.RecurringPayment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface RecurringPaymentRepository extends JpaRepository<RecurringPayment, Long> {
    List<RecurringPayment> findByUserId(Long userId);
    List<RecurringPayment> findByActiveTrueAndNextRunLessThanEqual(LocalDate date);
}
