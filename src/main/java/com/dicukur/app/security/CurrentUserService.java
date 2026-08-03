package com.dicukur.app.security;

import com.dicukur.app.user.entity.User;
import com.dicukur.app.user.repository.UserRepository;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

@Service
public class CurrentUserService {

    private final UserRepository userRepository;

    public CurrentUserService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    public User requireUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {
            throw new IllegalStateException("Sesi login sudah berakhir");
        }

        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new IllegalStateException("User tidak ditemukan"));
    }

    public User requireRole(String roleName) {
        User user = requireUser();
        if (user.getRole() == null || !roleName.equalsIgnoreCase(user.getRole().getName())) {
            throw new IllegalStateException("Akses hanya untuk role " + roleName);
        }
        return user;
    }
}
