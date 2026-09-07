package com.dicukur.app.barbershop.repository;

import com.dicukur.app.barbershop.entity.StaffInvitation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface StaffInvitationRepository extends JpaRepository<StaffInvitation, Long> {
    Optional<StaffInvitation> findByTokenHash(String tokenHash);
    List<StaffInvitation> findByBarbershop_IdOrderByCreatedAtDesc(Long barbershopId);
}
