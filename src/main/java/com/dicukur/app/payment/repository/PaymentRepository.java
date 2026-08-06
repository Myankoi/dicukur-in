package com.dicukur.app.payment.repository;

import com.dicukur.app.payment.entity.Payment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface PaymentRepository extends JpaRepository<Payment, Long> {
    Optional<Payment> findByBooking_Id(Long bookingId);

    List<Payment> findByStatusOrderByCreatedAtDesc(String status);

    List<Payment> findAllByOrderByCreatedAtDesc();

    long countByStatus(String status);
}
