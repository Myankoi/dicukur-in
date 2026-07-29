package com.dicukur.app.user.service;

import com.dicukur.app.user.entity.Role;
import com.dicukur.app.user.entity.User;
import com.dicukur.app.user.repository.RoleRepository;
import com.dicukur.app.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerCustomer(String name, String email, String phone, String rawPassword) {
        return registerUser(name, email, phone, rawPassword, "Customer", "active", null);
    }

    @Transactional
    public User registerBarberApplicant(String name, String email, String phone,
                                        String rawPassword, String notes) {
        return registerUser(name, email, phone, rawPassword, "Barber", "inactive", notes);
    }

    @Transactional
    public User registerOwnerApplicant(String name, String email, String phone,
                                       String rawPassword, String notes) {
        return registerUser(name, email, phone, rawPassword, "Owner", "inactive", notes);
    }

    private User registerUser(String name, String email, String phone,
                              String rawPassword, String roleName, String status, String notes) {
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email sudah terdaftar");
        }

        if (phone != null && !phone.isBlank() && userRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("Nomor telepon sudah terdaftar");
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Role " + roleName + " tidak ditemukan di database"));

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone != null && !phone.isBlank() ? phone : null);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setStatus(status);
        user.setNotes(notes);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }
}
