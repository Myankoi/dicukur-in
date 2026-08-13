package com.dicukur.app.user.repository;

import com.dicukur.app.user.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    boolean existsByEmail(String email);

    boolean existsByPhone(String phone);

    List<User> findByRole_NameOrderByCreatedAtDesc(String roleName);

    List<User> findAllByOrderByCreatedAtDesc();

    Optional<User> findByEmailAndIdNot(String email, Long id);

    Optional<User> findByPhoneAndIdNot(String phone, Long id);
}

