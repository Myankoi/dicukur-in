package com.dicukur.app.barbershop.repository;

import com.dicukur.app.barbershop.entity.BarbershopStaff;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BarbershopStaffRepository extends JpaRepository<BarbershopStaff, Long> {
    List<BarbershopStaff> findByBarbershop_IdOrderByJoinedAtDesc(Long barbershopId);

    List<BarbershopStaff> findByBarbershop_IdAndEmploymentStatus(Long barbershopId, String employmentStatus);

    Optional<BarbershopStaff> findByBarbershop_IdAndBarber_IdAndEmploymentStatus(Long barbershopId,
                                                                                  Long barberId,
                                                                                  String employmentStatus);
    Optional<BarbershopStaff> findFirstByBarber_Id(Long barberId);

    List<BarbershopStaff> findByBarber_Id(Long barberId);
}
