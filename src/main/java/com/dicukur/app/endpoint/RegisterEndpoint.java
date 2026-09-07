package com.dicukur.app.endpoint;

import com.dicukur.app.registration.dto.CustomerRegistrationRequest;
import com.dicukur.app.registration.dto.OwnerRegistrationRequest;
import com.dicukur.app.registration.dto.BarberInvitationRequest;
import com.dicukur.app.registration.dto.RegistrationResponse;
import com.dicukur.app.registration.service.RegistrationService;
import com.vaadin.hilla.BrowserCallable;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import com.dicukur.app.user.service.UserService;
import jakarta.validation.Valid;

@BrowserCallable
@AnonymousAllowed
public class RegisterEndpoint {

    private final UserService userService;
    private final RegistrationService registrationService;

    public RegisterEndpoint(UserService userService, RegistrationService registrationService) {
        this.userService = userService;
        this.registrationService = registrationService;
    }

    public void registerCustomer(@Valid CustomerRegistrationRequest request) {
        userService.registerCustomer(
                request.name(),
                request.email(),
                request.phone(),
                request.password()
        );
    }

    public void registerOwner(@Valid OwnerRegistrationRequest request) {
        userService.registerOwnerApplicant(request);
    }

    public RegistrationResponse acceptBarberInvitation(@Valid BarberInvitationRequest request) {
        return registrationService.acceptBarberInvitation(request);
    }
}
