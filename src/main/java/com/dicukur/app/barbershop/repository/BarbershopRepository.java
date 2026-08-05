package com.dicukur.app.barbershop.repository;

import com.dicukur.app.barbershop.entity.Barbershop;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface BarbershopRepository extends JpaRepository<Barbershop, Long> {
    @Query("""
            select b from Barbershop b
            where b.status = :status
              and b.verificationStatus = :verificationStatus
              and b.latitude between :minLatitude and :maxLatitude
              and b.longitude between :minLongitude and :maxLongitude
            """)
    List<Barbershop> findNearbyCandidates(@Param("status") String status,
                                           @Param("verificationStatus") String verificationStatus,
                                           @Param("minLatitude") BigDecimal minLatitude,
                                           @Param("maxLatitude") BigDecimal maxLatitude,
                                           @Param("minLongitude") BigDecimal minLongitude,
                                           @Param("maxLongitude") BigDecimal maxLongitude);

    Optional<Barbershop> findByIdAndStatusAndVerificationStatus(Long id, String status, String verificationStatus);
    Optional<Barbershop> findByOwner_Id(Long ownerId);
}
