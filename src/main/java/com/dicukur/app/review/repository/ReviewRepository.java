package com.dicukur.app.review.repository;

import com.dicukur.app.review.entity.Review;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface ReviewRepository extends JpaRepository<Review, Long> {
    Optional<Review> findByBooking_Id(Long bookingId);

    List<Review> findByBarbershop_IdAndIsVisibleTrueOrderByCreatedAtDesc(Long barbershopId);

    List<Review> findByBarber_IdAndIsVisibleTrueOrderByCreatedAtDesc(Long barberId);

    @Query("select coalesce(avg(r.rating), 0) from Review r where r.barber.id = :barberId and r.isVisible = true")
    BigDecimal calcAverageRatingByBarber(@Param("barberId") Long barberId);

    @Query("select coalesce(avg(r.rating), 0) from Review r where r.barbershop.id = :barbershopId and r.isVisible = true")
    BigDecimal calcAverageRatingByBarbershop(@Param("barbershopId") Long barbershopId);
}
