package com.dicukur.app.endpoint;

import com.dicukur.app.registration.dto.BarberRegistrationRequest;
import com.dicukur.app.registration.dto.CustomerRegistrationRequest;
import com.dicukur.app.registration.dto.OwnerRegistrationRequest;
import com.vaadin.hilla.BrowserCallable;
import com.dicukur.app.user.service.UserService;
import jakarta.annotation.security.PermitAll;
import jakarta.validation.Valid;

@BrowserCallable
@PermitAll
public class RegisterEndpoint {

    private final UserService userService;

    public RegisterEndpoint(UserService userService) {
        this.userService = userService;
    }

    public void registerCustomer(@Valid CustomerRegistrationRequest request) {
        userService.registerCustomer(
                request.name(),
                request.email(),
                request.phone(),
                request.password()
        );
    }

    public void registerBarber(@Valid BarberRegistrationRequest request) {
        userService.registerBarberApplicant(request);
    }

    public void registerOwner(@Valid OwnerRegistrationRequest request) {
        userService.registerOwnerApplicant(request);
    }
}
