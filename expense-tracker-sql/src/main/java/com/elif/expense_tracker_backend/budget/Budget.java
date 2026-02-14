package com.elif.expense_tracker_backend.budget;

import com.elif.expense_tracker_backend.user.User;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "budgets")
public class Budget {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @JsonIgnore
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false)
    private String category;

    /**
     * Stored as "YYYY-MM" for quick filtering.
     * Column renamed to avoid reserved word clashes in some DBs.
     */
    @Column(name = "month_key", nullable = false)
    private String month;

    @Column(nullable = false)
    private BigDecimal limitAmount;

    /**
     * Value between 0 and 1.0 representing warning threshold (e.g. 0.8 = 80%).
     */
    @Builder.Default
    private Double warningThreshold = 0.8;

    @Builder.Default
    private Instant createdAt = Instant.now();
}
