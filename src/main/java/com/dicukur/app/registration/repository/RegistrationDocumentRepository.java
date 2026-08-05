package com.dicukur.app.registration.repository;

import com.dicukur.app.registration.entity.RegistrationDocument;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RegistrationDocumentRepository extends JpaRepository<RegistrationDocument, Long> {
    List<RegistrationDocument> findByRegistration_Id(Long registrationId);
}
