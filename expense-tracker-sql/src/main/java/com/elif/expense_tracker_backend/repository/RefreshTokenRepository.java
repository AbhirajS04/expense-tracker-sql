package com.elif.expense_tracker_backend.repository;

import com.elif.expense_tracker_backend.token.RefreshToken;
import com.elif.expense_tracker_backend.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RefreshTokenRepository extends JpaRepository<RefreshToken, Long> {
    Optional<RefreshToken> findByToken(String token);
    void deleteByUser(User user);
}
