package com.dicukur.app.user.service;

import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.user.dto.AdminCreateUserRequest;
import com.dicukur.app.user.dto.AdminUpdateUserRequest;
import com.dicukur.app.user.dto.UserResponse;
import com.dicukur.app.user.entity.Role;
import com.dicukur.app.user.entity.User;
import com.dicukur.app.user.repository.RoleRepository;
import com.dicukur.app.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class AdminUserService {

    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final CurrentUserService currentUserService;

    public AdminUserService(UserRepository userRepository,
                            RoleRepository roleRepository,
                            PasswordEncoder passwordEncoder,
                            CurrentUserService currentUserService) {
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getUsersByRole(String roleName) {
        currentUserService.requireRole("Admin");
        return userRepository.findByRole_NameOrderByCreatedAtDesc(roleName).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public UserResponse createUser(AdminCreateUserRequest request) {
        currentUserService.requireRole("Admin");

        String normalizedName = requireText(request.name(), "Nama wajib diisi");
        String normalizedEmail = requireText(request.email(), "Email wajib diisi").toLowerCase(Locale.ROOT);
        String normalizedPhone = blankToNull(request.phone());
        String roleName = requireText(request.roleName(), "Role wajib ditentukan");

        if (!("Customer".equalsIgnoreCase(roleName) || "Owner".equalsIgnoreCase(roleName) || "Barber".equalsIgnoreCase(roleName))) {
            throw new IllegalArgumentException("Role hanya boleh Customer, Owner, atau Barber");
        }

        if (request.password() == null || request.password().length() < 6) {
            throw new IllegalArgumentException("Password minimal 6 karakter");
        }

        if (userRepository.existsByEmail(normalizedEmail)) {
            throw new IllegalArgumentException("Email already registered: " + normalizedEmail);
        }

        if (normalizedPhone != null && userRepository.existsByPhone(normalizedPhone)) {
            throw new IllegalArgumentException("Nomor telepon sudah terdaftar: " + normalizedPhone);
        }

        Role role = roleRepository.findByName(capitalize(roleName))
                .orElseThrow(() -> new IllegalArgumentException("Role " + roleName + " tidak ditemukan"));

        LocalDateTime now = LocalDateTime.now();
        User user = new User();
        user.setName(normalizedName);
        user.setEmail(normalizedEmail);
        user.setPhone(normalizedPhone);
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setRole(role);
        user.setStatus(request.status() != null && !request.status().isBlank() ? request.status() : "active");
        user.setNotes(blankToNull(request.notes()));
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public UserResponse updateUser(Long id, AdminUpdateUserRequest request) {
        currentUserService.requireRole("Admin");

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User dengan ID " + id + " tidak ditemukan"));

        String normalizedName = requireText(request.name(), "Nama wajib diisi");
        String normalizedEmail = requireText(request.email(), "Email wajib diisi").toLowerCase(Locale.ROOT);
        String normalizedPhone = blankToNull(request.phone());

        userRepository.findByEmailAndIdNot(normalizedEmail, id).ifPresent(u -> {
            throw new IllegalArgumentException("Email " + normalizedEmail + " sudah digunakan user lain");
        });

        if (normalizedPhone != null) {
            userRepository.findByPhoneAndIdNot(normalizedPhone, id).ifPresent(u -> {
                throw new IllegalArgumentException("Nomor hp " + normalizedPhone + " sudah digunakan user lain");
            });
        }

        user.setName(normalizedName);
        user.setEmail(normalizedEmail);
        user.setPhone(normalizedPhone);

        if (request.password() != null && !request.password().isBlank()) {
            if (request.password().length() < 6) {
                throw new IllegalArgumentException("Password baru minimal 6 karakter");
            }
            user.setPassword(passwordEncoder.encode(request.password()));
        }

        if (request.status() != null && !request.status().isBlank()) {
            user.setStatus(request.status());
        }

        user.setNotes(blankToNull(request.notes()));
        user.setUpdatedAt(LocalDateTime.now());

        return toResponse(userRepository.save(user));
    }

    @Transactional
    public void deleteUser(Long id) {
        User admin = currentUserService.requireRole("Admin");
        if (admin.getId().equals(id)) {
            throw new IllegalArgumentException("Tidak dapat menghapus akun admin yang sedang digunakan");
        }

        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("User tidak ditemukan"));

        // Soft delete dengan menonaktifkan status
        user.setStatus("suspended");
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
    }

    private UserResponse toResponse(User user) {
        return new UserResponse(
                user.getId(),
                user.getName(),
                user.getEmail(),
                user.getPhone(),
                user.getRole() != null ? user.getRole().getName() : "-",
                user.getStatus(),
                user.getNotes(),
                user.getCreatedAt() != null ? user.getCreatedAt().toString() : null,
                user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : null
        );
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

    private String capitalize(String str) {
        if (str == null || str.isEmpty()) return str;
        return str.substring(0, 1).toUpperCase() + str.substring(1).toLowerCase();
    }
}
