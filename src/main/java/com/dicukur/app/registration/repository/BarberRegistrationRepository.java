package com.dicukur.app.registration.repository;

import com.dicukur.app.registration.entity.BarberRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BarberRegistrationRepository extends JpaRepository<BarberRegistration, Long> {
    List<BarberRegistration> findAllByOrderBySubmittedAtDesc();
    List<BarberRegistration> findByStatusOrderBySubmittedAtDesc(String status);
}

