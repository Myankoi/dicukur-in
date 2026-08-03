package com.dicukur.app.barbershop.repository;

import com.dicukur.app.barbershop.entity.BarberProfile;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface BarberProfileRepository extends JpaRepository<BarberProfile, Long> {
    Optional<BarberProfile> findByUser_Id(Long userId);
}
