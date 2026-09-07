package com.dicukur.app.endpoint;

import com.dicukur.app.registration.dto.RegistrationDocumentRequest;
import com.dicukur.app.registration.dto.RegistrationResponse;
import com.dicukur.app.registration.service.RegistrationService;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;

@BrowserCallable
@RolesAllowed({"BARBER", "Barber", "ROLE_BARBER"})
public class BarberRegistrationEndpoint {
    private final RegistrationService registrationService;

    public BarberRegistrationEndpoint(RegistrationService registrationService) {
        this.registrationService = registrationService;
    }

    public RegistrationResponse getMyRegistration() {
        return registrationService.getMyStaffRegistration();
    }

    public RegistrationResponse addDocument(@Valid RegistrationDocumentRequest request) {
        return registrationService.addDocument(request);
    }
}
