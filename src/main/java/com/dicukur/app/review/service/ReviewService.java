package com.dicukur.app.review.service;

import com.dicukur.app.barbershop.entity.BarberProfile;
import com.dicukur.app.barbershop.entity.Barbershop;
import com.dicukur.app.barbershop.repository.BarberProfileRepository;
import com.dicukur.app.barbershop.repository.BarbershopRepository;
import com.dicukur.app.booking.entity.Booking;
import com.dicukur.app.booking.repository.BookingRepository;
import com.dicukur.app.notification.service.NotificationService;
import com.dicukur.app.review.dto.ReviewRequest;
import com.dicukur.app.review.dto.ReviewResponse;
import com.dicukur.app.review.entity.Review;
import com.dicukur.app.review.repository.ReviewRepository;
import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Service
@Transactional
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookingRepository bookingRepository;
    private final BarberProfileRepository barberProfileRepository;
    private final BarbershopRepository barbershopRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;

    public ReviewService(ReviewRepository reviewRepository,
                         BookingRepository bookingRepository,
                         BarberProfileRepository barberProfileRepository,
                         BarbershopRepository barbershopRepository,
                         CurrentUserService currentUserService,
                         NotificationService notificationService) {
        this.reviewRepository = reviewRepository;
        this.bookingRepository = bookingRepository;
        this.barberProfileRepository = barberProfileRepository;
        this.barbershopRepository = barbershopRepository;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
    }

    public ReviewResponse submitReview(ReviewRequest request) {
        User customer = currentUserService.requireUser();

        Booking booking = bookingRepository.findById(request.bookingId())
                .orElseThrow(() -> new IllegalArgumentException("Booking tidak ditemukan"));

        if (!booking.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalStateException("Anda tidak memiliki akses ke booking ini");
        }

        if (!"completed".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Ulasan hanya dapat diberikan setelah pesanan selesai");
        }

        Review review = reviewRepository.findByBooking_Id(booking.getId())
                .orElseGet(Review::new);

        review.setBooking(booking);
        review.setCustomer(customer);
        review.setBarber(booking.getBarber());
        review.setBarbershop(booking.getBarbershop());
        review.setRating(request.rating());
        review.setReview(request.review());
        review.setIsVisible(true);

        Review saved = reviewRepository.save(review);

        // Recalculate average rating for barber profile
        Long barberId = booking.getBarber().getId();
        BigDecimal avgBarberRating = reviewRepository.calcAverageRatingByBarber(barberId);
        barberProfileRepository.findByUser_Id(barberId).ifPresent(bp -> {
            bp.setRatingAverage(avgBarberRating);
            barberProfileRepository.save(bp);
        });

        // Recalculate average rating for barbershop if present
        if (booking.getBarbershop() != null) {
            Long shopId = booking.getBarbershop().getId();
            BigDecimal avgShopRating = reviewRepository.calcAverageRatingByBarbershop(shopId);
            barbershopRepository.findById(shopId).ifPresent(bs -> {
                bs.setRatingAverage(avgShopRating);
                barbershopRepository.save(bs);
            });
        }

        // Notify barber
        notificationService.createNotification(
                barberId,
                "Ulasan Baru Diterima",
                customer.getName() + " memberikan ulasan bintang " + request.rating() + " untuk booking #" + booking.getBookingCode(),
                "review",
                booking.getId()
        );

        return mapToResponse(saved);
    }

    @Transactional(readOnly = true)
    public ReviewResponse getReviewByBooking(Long bookingId) {
        return reviewRepository.findByBooking_Id(bookingId)
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByBarbershop(Long barbershopId) {
        return reviewRepository.findByBarbershop_IdAndIsVisibleTrueOrderByCreatedAtDesc(barbershopId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ReviewResponse> getReviewsByBarber(Long barberId) {
        return reviewRepository.findByBarber_IdAndIsVisibleTrueOrderByCreatedAtDesc(barberId)
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    private ReviewResponse mapToResponse(Review r) {
        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("dd MMM yyyy, HH:mm");
        return new ReviewResponse(
                r.getId(),
                r.getBooking().getId(),
                r.getCustomer() != null ? r.getCustomer().getName() : "-",
                r.getBarber() != null ? r.getBarber().getName() : "-",
                r.getBarbershop() != null ? r.getBarbershop().getName() : "-",
                r.getRating(),
                r.getReview(),
                r.getCreatedAt() != null ? r.getCreatedAt().format(fmt) : null
        );
    }
}
