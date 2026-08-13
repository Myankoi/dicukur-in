package com.dicukur.app.barbershop.repository;

import com.dicukur.app.barbershop.entity.BarberSchedule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface BarberScheduleRepository extends JpaRepository<BarberSchedule, Long> {
    List<BarberSchedule> findByBarber_IdAndDayOfWeekAndStatus(Long barberId, Byte dayOfWeek, String status);

    List<BarberSchedule> findByBarber_Id(Long barberId);
}
