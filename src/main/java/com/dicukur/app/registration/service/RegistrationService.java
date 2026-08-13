package com.dicukur.app.registration.service;

import com.dicukur.app.barbershop.entity.Barbershop;
import com.dicukur.app.barbershop.repository.BarbershopRepository;
import com.dicukur.app.registration.dto.DocumentResponse;
import com.dicukur.app.registration.dto.RegistrationResponse;
import com.dicukur.app.registration.entity.BarberRegistration;
import com.dicukur.app.registration.entity.RegistrationDocument;
import com.dicukur.app.registration.repository.BarberRegistrationRepository;
import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.user.entity.User;
import com.dicukur.app.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class RegistrationService {

    private final BarberRegistrationRepository registrationRepository;
    private final BarbershopRepository barbershopRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;

    public RegistrationService(BarberRegistrationRepository registrationRepository,
                               BarbershopRepository barbershopRepository,
                               UserRepository userRepository,
                               CurrentUserService currentUserService) {
        this.registrationRepository = registrationRepository;
        this.barbershopRepository = barbershopRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<RegistrationResponse> getAllRegistrations() {
        currentUserService.requireRole("Admin");
        return registrationRepository.findAllByOrderBySubmittedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public RegistrationResponse approveRegistration(Long registrationId, String adminNotes) {
        User admin = currentUserService.requireRole("Admin");

        BarberRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Data pendaftaran tidak ditemukan"));

        if ("approved".equalsIgnoreCase(registration.getStatus())) {
            throw new IllegalArgumentException("Pendaftaran ini sudah disetujui sebelumnya");
        }

        LocalDateTime now = LocalDateTime.now();
        registration.setStatus("approved");
        registration.setReviewedBy(admin);
        registration.setReviewedAt(now);
        registration.setAdminNotes(blankToNull(adminNotes));
        registration.setUpdatedAt(now);
        registrationRepository.save(registration);

        User applicant = registration.getApplicant();
        applicant.setStatus("active");
        applicant.setUpdatedAt(now);
        userRepository.save(applicant);

        Barbershop shop = barbershopRepository.findByOwner_Id(applicant.getId())
                .orElseGet(Barbershop::new);

        shop.setOwner(applicant);
        shop.setRegistration(registration);
        shop.setName(registration.getBusinessName() != null ? registration.getBusinessName().trim() : "Barbershop " + applicant.getName());
        shop.setDescription(blankToNull(registration.getDescription()));
        shop.setBusinessPhone(applicant.getPhone());
        shop.setBusinessEmail(applicant.getEmail());
        shop.setBusinessLicenseNumber(blankToNull(registration.getBusinessLicenseNumber()));
        shop.setBusinessAddress(registration.getAddress() != null ? registration.getAddress().trim() : "Alamat Belum Diatur");
        shop.setDistrict(blankToNull(registration.getDistrict()));
        shop.setCity(blankToNull(registration.getCity()));
        shop.setProvince(blankToNull(registration.getProvince()));
        shop.setPostalCode(blankToNull(registration.getPostalCode()));
        shop.setLatitude(registration.getLatitude() != null ? registration.getLatitude() : new BigDecimal("-6.20880000"));
        shop.setLongitude(registration.getLongitude() != null ? registration.getLongitude() : new BigDecimal("106.84560000"));
        shop.setServiceRadiusKm(registration.getServiceRadiusKm() != null ? registration.getServiceRadiusKm() : new BigDecimal("10.00"));
        shop.setVerificationStatus("approved");
        shop.setStatus("active");
        if (shop.getRatingAverage() == null) shop.setRatingAverage(BigDecimal.ZERO);
        if (shop.getTotalCompleted() == null) shop.setTotalCompleted(0);
        if (shop.getCreatedAt() == null) shop.setCreatedAt(now);
        shop.setUpdatedAt(now);
        barbershopRepository.save(shop);

        return toResponse(registration);
    }

    @Transactional
    public RegistrationResponse rejectRegistration(Long registrationId, String rejectionReason) {
        User admin = currentUserService.requireRole("Admin");

        if (rejectionReason == null || rejectionReason.isBlank()) {
            throw new IllegalArgumentException("Alasan penolakan wajib diisi");
        }

        BarberRegistration registration = registrationRepository.findById(registrationId)
                .orElseThrow(() -> new IllegalArgumentException("Data pendaftaran tidak ditemukan"));

        if ("rejected".equalsIgnoreCase(registration.getStatus())) {
            throw new IllegalArgumentException("Pendaftaran ini sudah ditolak sebelumnya");
        }

        LocalDateTime now = LocalDateTime.now();
        registration.setStatus("rejected");
        registration.setRejectionReason(rejectionReason.trim());
        registration.setReviewedBy(admin);
        registration.setReviewedAt(now);
        registration.setUpdatedAt(now);
        registrationRepository.save(registration);

        return toResponse(registration);
    }

    private RegistrationResponse toResponse(BarberRegistration reg) {
        List<DocumentResponse> docs = reg.getDocuments().stream().map(d -> new DocumentResponse(
                d.getId(),
                d.getDocumentType(),
                d.getFileName(),
                d.getFilePath(),
                d.getMimeType(),
                d.getFileSize(),
                d.getVerificationStatus(),
                d.getAdminNotes()
        )).toList();

        return new RegistrationResponse(
                reg.getId(),
                reg.getApplicant() != null ? reg.getApplicant().getId() : null,
                reg.getApplicant() != null ? reg.getApplicant().getName() : "-",
                reg.getApplicant() != null ? reg.getApplicant().getEmail() : "-",
                reg.getApplicant() != null ? reg.getApplicant().getPhone() : "-",
                reg.getRegistrationType(),
                reg.getBusinessName(),
                reg.getBusinessLicenseNumber(),
                reg.getDescription(),
                reg.getAddress(),
                reg.getDistrict(),
                reg.getCity(),
                reg.getProvince(),
                reg.getPostalCode(),
                reg.getServiceRadiusKm(),
                reg.getStatus(),
                reg.getSubmittedAt() != null ? reg.getSubmittedAt().toString() : null,
                reg.getReviewedBy() != null ? reg.getReviewedBy().getName() : null,
                reg.getReviewedAt() != null ? reg.getReviewedAt().toString() : null,
                reg.getAdminNotes(),
                reg.getRejectionReason(),
                docs
        );
    }

    private String blankToNull(String val) {
        return val == null || val.isBlank() ? null : val.trim();
    }
}
