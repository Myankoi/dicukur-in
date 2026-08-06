package com.dicukur.app.endpoint;

import com.dicukur.app.review.dto.ReviewRequest;
import com.dicukur.app.review.dto.ReviewResponse;
import com.dicukur.app.review.service.ReviewService;
import com.vaadin.hilla.BrowserCallable;
import com.vaadin.hilla.Nullable;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;

import java.util.List;

@BrowserCallable
@PermitAll
public class ReviewEndpoint {

    private final ReviewService reviewService;

    public ReviewEndpoint(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @RolesAllowed({"CUSTOMER", "Customer"})
    public ReviewResponse submitReview(ReviewRequest request) {
        return reviewService.submitReview(request);
    }

    @Nullable
    public ReviewResponse getReviewByBooking(Long bookingId) {
        return reviewService.getReviewByBooking(bookingId);
    }

    public List<ReviewResponse> getReviewsByBarbershop(Long barbershopId) {
        return reviewService.getReviewsByBarbershop(barbershopId);
    }

    public List<ReviewResponse> getReviewsByBarber(Long barberId) {
        return reviewService.getReviewsByBarber(barberId);
    }
}
