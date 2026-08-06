package com.dicukur.app.booking.repository;

import com.dicukur.app.booking.entity.Booking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;
import java.util.Optional;

public interface BookingRepository extends JpaRepository<Booking, Long> {
    @Query("""
            select count(b) > 0 from Booking b
            where b.barber.id = :barberId
              and b.startDatetime < :endDatetime
              and b.endDatetime > :startDatetime
              and b.status in :statuses
            """)
    boolean existsOverlapping(@Param("barberId") Long barberId,
                              @Param("startDatetime") LocalDateTime startDatetime,
                              @Param("endDatetime") LocalDateTime endDatetime,
                              @Param("statuses") Collection<String> statuses);

    List<Booking> findByCustomer_IdOrderByStartDatetimeDesc(Long customerId);

    List<Booking> findByCustomer_IdAndId(Long customerId, Long id);

    Optional<Booking> findByBookingCode(String bookingCode);

    long countByBarbershop_Id(Long barbershopId);

    long countByBarbershop_IdAndStatus(Long barbershopId, String status);
}
