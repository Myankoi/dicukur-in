package com.dicukur.app.barbershop.repository;

import com.dicukur.app.barbershop.entity.BarbershopPhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BarbershopPhotoRepository extends JpaRepository<BarbershopPhoto, Long> {
    List<BarbershopPhoto> findByBarbershopIdOrderBySortOrderAsc(Long barbershopId);
    long countByBarbershopId(Long barbershopId);
}
