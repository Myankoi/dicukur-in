package com.dicukur.app.barbershop.repository;

import com.dicukur.app.barbershop.entity.BarberTimeOff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;

public interface BarberTimeOffRepository extends JpaRepository<BarberTimeOff, Long> {
    @Query("""
            select count(t) > 0 from BarberTimeOff t
            where t.barber.id = :barberId
              and t.startDatetime < :endDatetime
              and t.endDatetime > :startDatetime
            """)
    boolean existsOverlapping(@Param("barberId") Long barberId,
                              @Param("startDatetime") LocalDateTime startDatetime,
                              @Param("endDatetime") LocalDateTime endDatetime);
}
