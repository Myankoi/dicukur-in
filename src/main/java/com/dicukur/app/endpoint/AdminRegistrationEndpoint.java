package com.dicukur.app.endpoint;

import com.dicukur.app.registration.dto.RegistrationResponse;
import com.dicukur.app.registration.service.RegistrationService;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;

import java.util.List;

@BrowserCallable
@RolesAllowed({"ADMIN", "Admin", "ROLE_ADMIN"})
public class AdminRegistrationEndpoint {

    private final RegistrationService registrationService;

    public AdminRegistrationEndpoint(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    public List<RegistrationResponse> getAllRegistrations() {
        return registrationService.getAllRegistrations();
    }

    public RegistrationResponse approveRegistration(Long registrationId, String adminNotes) {
        return registrationService.approveRegistration(registrationId, adminNotes);
    }

    public RegistrationResponse rejectRegistration(Long registrationId, String rejectionReason) {
        return registrationService.rejectRegistration(registrationId, rejectionReason);
    }
}
