package com.dicukur.app.service.repository;

import com.dicukur.app.service.entity.ServiceOffering;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface ServiceOfferingRepository extends JpaRepository<ServiceOffering, Long> {
    Optional<ServiceOffering> findByIdAndStatus(Long id, String status);
    List<ServiceOffering> findAllByStatus(String status);
}
