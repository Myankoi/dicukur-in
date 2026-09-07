package com.dicukur.app.endpoint;

import com.dicukur.app.tracking.dto.TrackingResponse;
import com.dicukur.app.tracking.service.TrackingService;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.RolesAllowed;

@BrowserCallable
@RolesAllowed({"CUSTOMER", "Customer", "BARBER", "Barber", "ADMIN", "Admin", "ROLE_ADMIN", "ROLE_BARBER", "ROLE_CUSTOMER"})
public class TrackingEndpoint {
    private final TrackingService trackingService;

    public TrackingEndpoint(TrackingService trackingService) {
        this.trackingService = trackingService;
    }

    public TrackingResponse getTracking(Long bookingId) {
        return trackingService.getTracking(bookingId);
    }
}
