package com.dicukur.app.endpoint;

import com.dicukur.app.barbershop.dto.*;
import com.dicukur.app.barbershop.service.BarberService;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.RolesAllowed;

import java.util.List;

@BrowserCallable
@RolesAllowed({"BARBER", "Barber", "ROLE_BARBER"})
public class BarberEndpoint {

    private final BarberService barberService;

    public BarberEndpoint(BarberService barberService) {
        this.barberService = barberService;
    }

    // Schedule
    public List<BarberScheduleResponse> getMySchedules() {
        return barberService.getMySchedules();
    }

    public BarberScheduleResponse saveSchedule(BarberScheduleRequest request) {
        return barberService.saveSchedule(request);
    }

    public void deleteSchedule(Long id) {
        barberService.deleteSchedule(id);
    }

    // Time Off
    public List<BarberTimeOffResponse> getMyTimeOffs() {
        return barberService.getMyTimeOffs();
    }

    public BarberTimeOffResponse saveTimeOff(BarberTimeOffRequest request) {
        return barberService.saveTimeOff(request);
    }

    public void deleteTimeOff(Long id) {
        barberService.deleteTimeOff(id);
    }

    // Bookings
    public List<BarberBookingResponse> getIncomingBookings() {
        return barberService.getIncomingBookings();
    }

    public List<BarberBookingResponse> getBookingHistory() {
        return barberService.getBookingHistory();
    }

    public BarberBookingResponse acceptBooking(Long bookingId) {
        return barberService.acceptBooking(bookingId);
    }

    public BarberBookingResponse rejectBooking(Long bookingId, String reason) {
        return barberService.rejectBooking(bookingId, reason);
    }

    public BarberBookingResponse cancelBooking(Long bookingId, String reason) {
        return barberService.cancelBooking(bookingId, reason);
    }

    public BarberBookingResponse updateBookingStatus(Long bookingId, String newStatus) {
        return barberService.updateBookingStatus(bookingId, newStatus);
    }

    public BarberBookingResponse startTrip(Long bookingId, java.math.BigDecimal latitude,
                                           java.math.BigDecimal longitude, java.math.BigDecimal accuracy) {
        return barberService.startTrip(bookingId, latitude, longitude, accuracy);
    }

    public BarberBookingResponse updateLiveLocation(Long bookingId, java.math.BigDecimal latitude, java.math.BigDecimal longitude) {
        return barberService.updateLiveLocation(bookingId, latitude, longitude);
    }

    public BarberBookingResponse updateLiveLocationWithAccuracy(Long bookingId, java.math.BigDecimal latitude,
                                                                java.math.BigDecimal longitude, java.math.BigDecimal accuracy) {
        return barberService.updateLiveLocation(bookingId, latitude, longitude, accuracy);
    }

    // Dashboard
    public BarberDashboardResponse getDashboardSummary() {
        return barberService.getDashboardSummary();
    }

    // Profile
    public BarberProfileResponse getMyProfile() {
        return barberService.getMyProfile();
    }

    public BarberProfileResponse updateMyProfile(BarberProfileUpdateRequest request) {
        return barberService.updateMyProfile(request);
    }

    public BarberProfileResponse toggleAvailability() {
        return barberService.toggleAvailability();
    }
}
