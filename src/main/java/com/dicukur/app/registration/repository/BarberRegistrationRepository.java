package com.dicukur.app.registration.repository;

import com.dicukur.app.registration.entity.BarberRegistration;
import org.springframework.data.jpa.repository.JpaRepository;

public interface BarberRegistrationRepository extends JpaRepository<BarberRegistration, Long> {
}
