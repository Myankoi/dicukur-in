package com.dicukur.app.endpoint;

import com.dicukur.app.booking.dto.BookingRequest;
import com.dicukur.app.booking.dto.BookingResponse;
import com.dicukur.app.booking.service.BookingService;
import com.vaadin.hilla.BrowserCallable;
import com.vaadin.hilla.exception.EndpointException;
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
        try {
            return bookingService.create(request);
        } catch (EndpointException e) {
            throw e;
        } catch (Exception e) {
            throw new EndpointException(e.getMessage() != null ? e.getMessage() : "Gagal membuat booking");
        }
    }

    public List<BookingResponse> getMyBookings() {
        try {
            return bookingService.getMyBookings();
        } catch (EndpointException e) {
            throw e;
        } catch (Exception e) {
            throw new EndpointException(e.getMessage() != null ? e.getMessage() : "Gagal mengambil daftar booking");
        }
    }

    public BookingResponse getBookingById(Long id) {
        try {
            return bookingService.getBookingById(id);
        } catch (EndpointException e) {
            throw e;
        } catch (Exception e) {
            throw new EndpointException(e.getMessage() != null ? e.getMessage() : "Gagal mengambil detail booking");
        }
    }

    public void cancel(Long id, String reason) {
        try {
            bookingService.cancel(id, reason);
        } catch (EndpointException e) {
            throw e;
        } catch (Exception e) {
            throw new EndpointException(e.getMessage() != null ? e.getMessage() : "Gagal membatalkan booking");
        }
    }
}
