package com.dicukur.app.booking.entity;

import com.dicukur.app.address.entity.CustomerAddress;
import com.dicukur.app.barbershop.entity.Barbershop;
import com.dicukur.app.service.entity.PricingRule;
import com.dicukur.app.user.entity.User;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@Entity
@Table(name = "bookings")
public class Booking {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "booking_code", nullable = false, unique = true, length = 30)
    private String bookingCode;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "customer_id", nullable = false)
    private User customer;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "barber_id", nullable = false)
    private User barber;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "barbershop_id")
    private Barbershop barbershop;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_address_id")
    private CustomerAddress customerAddress;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "pricing_rule_id")
    private PricingRule pricingRule;

    @Column(name = "start_datetime", nullable = false)
    private LocalDateTime startDatetime;

    @Column(name = "end_datetime", nullable = false)
    private LocalDateTime endDatetime;

    @Column(name = "address_snapshot", nullable = false, columnDefinition = "TEXT")
    private String addressSnapshot;

    @Column(name = "customer_latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal customerLatitude;

    @Column(name = "customer_longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal customerLongitude;

    @Column(name = "barber_base_snapshot", columnDefinition = "TEXT")
    private String barberBaseSnapshot;

    @Column(name = "barber_latitude", nullable = false, precision = 10, scale = 8)
    private BigDecimal barberLatitude;

    @Column(name = "barber_longitude", nullable = false, precision = 11, scale = 8)
    private BigDecimal barberLongitude;

    @Column(name = "distance_km", nullable = false, precision = 8, scale = 2)
    private BigDecimal distanceKm;

    @Column(name = "free_radius_km", nullable = false, precision = 6, scale = 2)
    private BigDecimal freeRadiusKm;

    @Column(name = "price_per_km", nullable = false, precision = 12, scale = 2)
    private BigDecimal pricePerKm;

    @Column(name = "travel_fee", nullable = false, precision = 12, scale = 2)
    private BigDecimal travelFee;

    @Column(name = "service_subtotal", nullable = false, precision = 12, scale = 2)
    private BigDecimal serviceSubtotal;

    @Column(name = "total_price", nullable = false, precision = 12, scale = 2)
    private BigDecimal totalPrice;

    @Column(nullable = false, length = 30)
    private String status;

    @Column(name = "payment_status", nullable = false, length = 30)
    private String paymentStatus;

    @Column(columnDefinition = "TEXT")
    private String notes;

    @Column(name = "cancellation_reason", columnDefinition = "TEXT")
    private String cancellationReason;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "booking", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<BookingDetail> details = new ArrayList<>();

    public void addDetail(BookingDetail detail) {
        details.add(detail);
        detail.setBooking(this);
    }
}
