package com.dicukur.app.endpoint;

import com.vaadin.hilla.BrowserCallable;
import com.dicukur.app.user.dto.ProfileResponse;
import com.dicukur.app.user.dto.ProfileUpdateRequest;
import com.dicukur.app.user.service.UserService;
import com.dicukur.app.user.repository.UserRepository;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

@BrowserCallable
@AnonymousAllowed
public class UserEndpoint {

    private final UserRepository userRepository;
    private final UserService userService;

    public UserEndpoint(UserRepository userRepository, UserService userService) {
        this.userRepository = userRepository;
        this.userService = userService;
    }

    public Optional<UserInfoRecord> getCurrentUser() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || "anonymousUser".equals(auth.getPrincipal())) {
            return Optional.empty();
        }
        return userRepository.findByEmail(auth.getName())
                .map(u -> new UserInfoRecord(u.getName(), u.getEmail(),
                        u.getRole().getName()));
    }

    @RolesAllowed({"CUSTOMER", "Customer", "BARBER", "Barber", "OWNER", "Owner", "ADMIN", "Admin"})
    public ProfileResponse getMyProfile() {
        return userService.getMyProfile();
    }

    @RolesAllowed({"CUSTOMER", "Customer", "BARBER", "Barber", "OWNER", "Owner", "ADMIN", "Admin"})
    public ProfileResponse updateMyProfile(@Valid ProfileUpdateRequest request) {
        return userService.updateMyProfile(request);
    }
}
