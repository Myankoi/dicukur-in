package com.dicukur.app.registration.repository;

import com.dicukur.app.registration.entity.BarberRegistration;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BarberRegistrationRepository extends JpaRepository<BarberRegistration, Long> {

    @EntityGraph(attributePaths = {"applicant", "reviewedBy", "documents"})
    List<BarberRegistration> findAllByOrderBySubmittedAtDesc();

    @EntityGraph(attributePaths = {"applicant", "reviewedBy", "documents"})
    List<BarberRegistration> findByStatusOrderBySubmittedAtDesc(String status);
}
