package com.dicukur.app.endpoint;

import com.dicukur.app.booking.dto.BookingRequest;
import com.dicukur.app.booking.dto.BookingResponse;
import com.dicukur.app.booking.service.BookingService;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;

import java.util.List;

@BrowserCallable
@RolesAllowed("CUSTOMER")
public class BookingEndpoint {

    private final BookingService bookingService;

    public BookingEndpoint(BookingService bookingService) {
        this.bookingService = bookingService;
    }

    public BookingResponse create(@Valid BookingRequest request) {
        return bookingService.create(request);
    }

    public List<BookingResponse> getMyBookings() {
        return bookingService.getMyBookings();
    }

    public BookingResponse getBookingById(Long id) {
        return bookingService.getBookingById(id);
    }

    public void cancel(Long id, String reason) {
        bookingService.cancel(id, reason);
    }
}
