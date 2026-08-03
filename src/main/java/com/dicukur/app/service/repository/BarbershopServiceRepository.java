package com.dicukur.app.service.repository;

import com.dicukur.app.service.entity.BarbershopService;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface BarbershopServiceRepository extends JpaRepository<BarbershopService, Long> {
    List<BarbershopService> findByBarbershop_IdAndStatus(Long barbershopId, String status);

    Optional<BarbershopService> findByBarbershop_IdAndService_IdAndStatus(Long barbershopId,
                                                                            Long serviceId,
                                                                            String status);
}
