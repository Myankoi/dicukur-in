package com.dicukur.app.endpoint;

import com.vaadin.hilla.BrowserCallable;
import com.dicukur.app.user.repository.UserRepository;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Optional;

@BrowserCallable
@AnonymousAllowed
public class UserEndpoint {

    private final UserRepository userRepository;

    public UserEndpoint(UserRepository userRepository) {
        this.userRepository = userRepository;
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
}
