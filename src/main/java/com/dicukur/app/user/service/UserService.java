package com.dicukur.app.user.service;

import com.dicukur.app.registration.dto.OwnerRegistrationRequest;
import com.dicukur.app.registration.entity.BarberRegistration;
import com.dicukur.app.registration.repository.BarberRegistrationRepository;
import com.dicukur.app.user.entity.Role;
import com.dicukur.app.user.entity.User;
import com.dicukur.app.user.repository.RoleRepository;
import com.dicukur.app.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Locale;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final BarberRegistrationRepository registrationRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository,
                       RoleRepository roleRepository,
                       BarberRegistrationRepository registrationRepository,
                       PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.registrationRepository = registrationRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public User registerCustomer(String name, String email, String phone, String rawPassword) {
        return registerUser(name, email, phone, rawPassword, "Customer", "active", null);
    }

    @Transactional
    public User registerOwnerApplicant(OwnerRegistrationRequest request) {
        User user = registerUser(
                request.name(),
                request.email(),
                request.phone(),
                request.password(),
                "Owner",
                "inactive",
                null
        );

        BarberRegistration registration = newRegistration(user, "business", request.serviceRadiusKm());
        registration.setBusinessName(request.businessName().trim());
        registration.setBusinessLicenseNumber(blankToNull(request.businessLicenseNumber()));
        registration.setDescription(blankToNull(request.description()));
        registration.setAddress(request.address().trim());
        registration.setDistrict(blankToNull(request.district()));
        registration.setCity(request.city().trim());
        registration.setProvince(request.province().trim());
        registration.setPostalCode(blankToNull(request.postalCode()));
        registrationRepository.save(registration);
        return user;
    }

    private User registerUser(String name, String email, String phone,
                              String rawPassword, String roleName, String status, String notes) {
        String normalizedName = requireText(name, "Nama wajib diisi");
        String normalizedEmail = requireText(email, "Email wajib diisi").toLowerCase(Locale.ROOT);
        String normalizedPhone = blankToNull(phone);

        if (rawPassword == null || rawPassword.length() < 8) {
            throw new IllegalArgumentException("Kata sandi minimal 8 karakter");
        }
        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email sudah terdaftar");
        }

        if (normalizedPhone != null && userRepository.existsByPhone(normalizedPhone)) {
            throw new IllegalArgumentException("Nomor telepon sudah terdaftar");
        }

        Role role = roleRepository.findByName(roleName)
                .orElseThrow(() -> new IllegalStateException("Role " + roleName + " tidak ditemukan di database"));

        User user = new User();
        user.setName(normalizedName);
        user.setEmail(normalizedEmail);
        user.setPhone(normalizedPhone);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(role);
        user.setStatus(status);
        user.setNotes(notes);
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }

    private BarberRegistration newRegistration(User user, String type, BigDecimal radius) {
        LocalDateTime now = LocalDateTime.now();
        BarberRegistration registration = new BarberRegistration();
        registration.setApplicant(user);
        registration.setRegistrationType(type);
        registration.setServiceRadiusKm(radius != null ? radius : BigDecimal.TEN);
        registration.setStatus("submitted");
        registration.setSubmittedAt(now);
        registration.setCreatedAt(now);
        registration.setUpdatedAt(now);
        return registration;
    }

    private String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(message);
        }
        return value.trim();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
