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

    /**
     * Register customer baru.
     * Otomatis assign role "Customer" dan hash password.
     */
    @Transactional
    public User registerCustomer(String name, String email, String phone, String rawPassword) {
        // Validasi email unik
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email sudah terdaftar");
        }

        // Validasi phone unik (jika diisi)
        if (phone != null && !phone.isBlank() && userRepository.existsByPhone(phone)) {
            throw new IllegalArgumentException("Nomor telepon sudah terdaftar");
        }

        // Ambil role Customer
        Role customerRole = roleRepository.findByName("Customer")
                .orElseThrow(() -> new IllegalStateException("Role Customer tidak ditemukan di database"));

        User user = new User();
        user.setName(name);
        user.setEmail(email);
        user.setPhone(phone != null && !phone.isBlank() ? phone : null);
        user.setPassword(passwordEncoder.encode(rawPassword));
        user.setRole(customerRole);
        user.setStatus("active");
        user.setCreatedAt(LocalDateTime.now());
        user.setUpdatedAt(LocalDateTime.now());

        return userRepository.save(user);
    }
}
