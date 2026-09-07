package com.dicukur.app.registration.service;

import com.dicukur.app.barbershop.entity.Barbershop;
import com.dicukur.app.barbershop.entity.BarberProfile;
import com.dicukur.app.barbershop.entity.BarbershopStaff;
import com.dicukur.app.barbershop.repository.BarbershopRepository;
import com.dicukur.app.barbershop.repository.BarberProfileRepository;
import com.dicukur.app.barbershop.repository.BarbershopStaffRepository;
import com.dicukur.app.admin.service.AdminAuditService;
import com.dicukur.app.barbershop.entity.StaffInvitation;
import com.dicukur.app.barbershop.repository.StaffInvitationRepository;
import com.dicukur.app.registration.dto.BarberInvitationRequest;
import com.dicukur.app.registration.dto.RegistrationDocumentRequest;
import com.dicukur.app.registration.dto.DocumentResponse;
import com.dicukur.app.registration.dto.RegistrationResponse;
import com.dicukur.app.registration.entity.BarberRegistration;
import com.dicukur.app.registration.entity.RegistrationDocument;
import com.dicukur.app.registration.repository.BarberRegistrationRepository;
import com.dicukur.app.registration.repository.RegistrationDocumentRepository;
import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.user.entity.User;
import com.dicukur.app.user.repository.UserRepository;
import com.dicukur.app.user.repository.RoleRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

@Service
public class RegistrationService {

    private final BarberRegistrationRepository registrationRepository;
    private final BarbershopRepository barbershopRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final RegistrationDocumentRepository documentRepository;
    private final StaffInvitationRepository invitationRepository;
    private final BarberProfileRepository barberProfileRepository;
    private final BarbershopStaffRepository staffRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final AdminAuditService auditService;

    public RegistrationService(BarberRegistrationRepository registrationRepository,
                               BarbershopRepository barbershopRepository,
                               UserRepository userRepository,
                               CurrentUserService currentUserService,
                               RegistrationDocumentRepository documentRepository,
                               StaffInvitationRepository invitationRepository,
                               BarberProfileRepository barberProfileRepository,
                               BarbershopStaffRepository staffRepository,
                               RoleRepository roleRepository,
                               PasswordEncoder passwordEncoder,
                               AdminAuditService auditService) {
        this.registrationRepository = registrationRepository;
        this.barbershopRepository = barbershopRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.documentRepository = documentRepository;
        this.invitationRepository = invitationRepository;
        this.barberProfileRepository = barberProfileRepository;
        this.staffRepository = staffRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.auditService = auditService;
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

        if ("staff".equalsIgnoreCase(registration.getRegistrationType())) {
            boolean identityValid = registration.getDocuments().stream().anyMatch(d ->
                    "identity_card".equalsIgnoreCase(d.getDocumentType()) && "valid".equalsIgnoreCase(d.getVerificationStatus()));
            boolean skillValid = registration.getDocuments().stream().anyMatch(d ->
                    ("competency_certificate".equalsIgnoreCase(d.getDocumentType())
                            || "portfolio".equalsIgnoreCase(d.getDocumentType()))
                            && "valid".equalsIgnoreCase(d.getVerificationStatus()));
            if (!identityValid || !skillValid) {
                throw new IllegalStateException("Barber wajib memiliki KTP valid dan sertifikat kompetensi atau portofolio valid");
            }
        }

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

        if ("staff".equalsIgnoreCase(registration.getRegistrationType())) {
            activateStaffRegistration(registration, applicant, now);
            auditService.record("APPROVE_REGISTRATION", "REGISTRATION", registration.getId(), "Staff barber disetujui");
            return toResponse(registration);
        }

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
        auditService.record("APPROVE_REGISTRATION", "REGISTRATION", registration.getId(), "Owner/barbershop disetujui");

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
        auditService.record("REJECT_REGISTRATION", "REGISTRATION", registration.getId(), registration.getRejectionReason());

        return toResponse(registration);
    }

    @Transactional
    public RegistrationResponse acceptBarberInvitation(BarberInvitationRequest request) {
        String tokenHash = hashToken(request.token());
        StaffInvitation invitation = invitationRepository.findByTokenHash(tokenHash)
                .orElseThrow(() -> new IllegalArgumentException("Undangan barber tidak ditemukan atau sudah tidak berlaku"));
        if (!"pending".equalsIgnoreCase(invitation.getStatus()) || invitation.getExpiresAt().isBefore(LocalDateTime.now())) {
            throw new IllegalStateException("Undangan barber sudah kedaluwarsa atau sudah digunakan");
        }
        String email = request.email().trim().toLowerCase(Locale.ROOT);
        if (!invitation.getEmail().equalsIgnoreCase(email)) {
            throw new IllegalArgumentException("Email harus sama dengan email pada undangan");
        }
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email sudah terdaftar. Gunakan akun barber yang sudah tersedia untuk melamar melalui owner.");
        }

        User barber = new User();
        barber.setName(request.name().trim());
        barber.setEmail(email);
        barber.setPhone(request.phone() == null || request.phone().isBlank() ? invitation.getPhone() : request.phone().trim());
        barber.setPassword(passwordEncoder.encode(request.password()));
        barber.setRole(roleRepository.findByName("Barber")
                .orElseThrow(() -> new IllegalStateException("Role Barber tidak ditemukan")));
        barber.setStatus("active");
        barber.setCreatedAt(LocalDateTime.now());
        barber.setUpdatedAt(LocalDateTime.now());
        User savedBarber = userRepository.save(barber);

        BarberRegistration registration = new BarberRegistration();
        registration.setApplicant(savedBarber);
        registration.setTargetBarbershop(invitation.getBarbershop());
        registration.setRegistrationType("staff");
        registration.setServiceRadiusKm(invitation.getBarbershop().getServiceRadiusKm() == null
                ? BigDecimal.TEN : invitation.getBarbershop().getServiceRadiusKm());
        registration.setStatus("submitted");
        registration.setSubmittedAt(LocalDateTime.now());
        registration.setCreatedAt(LocalDateTime.now());
        registration.setUpdatedAt(LocalDateTime.now());
        registrationRepository.save(registration);

        invitation.setStatus("accepted");
        invitation.setAcceptedAt(LocalDateTime.now());
        invitation.setUpdatedAt(LocalDateTime.now());
        invitationRepository.save(invitation);
        return toResponse(registration);
    }

    @Transactional
    public RegistrationResponse addDocument(RegistrationDocumentRequest request) {
        User barber = currentUserService.requireRole("Barber");
        BarberRegistration registration = registrationRepository.findById(request.registrationId())
                .orElseThrow(() -> new IllegalArgumentException("Registrasi barber tidak ditemukan"));
        if (!registration.getApplicant().getId().equals(barber.getId())
                || !"staff".equalsIgnoreCase(registration.getRegistrationType())) {
            throw new IllegalStateException("Anda tidak memiliki akses ke registrasi ini");
        }
        if (!List.of("identity_card", "competency_certificate", "portfolio").contains(request.documentType())) {
            throw new IllegalArgumentException("Jenis dokumen barber tidak didukung");
        }
        RegistrationDocument document = new RegistrationDocument();
        document.setRegistration(registration);
        document.setDocumentType(request.documentType());
        document.setFileName(request.fileName() == null ? "Dokumen" : request.fileName());
        document.setFilePath(request.filePath());
        document.setMimeType(request.mimeType());
        document.setFileSize(request.fileSize());
        document.setVerificationStatus("pending");
        document.setUploadedAt(LocalDateTime.now());
        documentRepository.save(document);
        registration.setStatus("submitted");
        registration.setUpdatedAt(LocalDateTime.now());
        return toResponse(registrationRepository.save(registration));
    }

    @Transactional(readOnly = true)
    public RegistrationResponse getMyStaffRegistration() {
        User barber = currentUserService.requireRole("Barber");
        return registrationRepository.findFirstByApplicant_IdAndRegistrationTypeOrderByCreatedAtDesc(barber.getId(), "staff")
                .map(this::toResponse).orElse(null);
    }

    @Transactional
    public RegistrationResponse verifyDocument(Long documentId, String action, String notes) {
        User admin = currentUserService.requireRole("Admin");
        RegistrationDocument document = documentRepository.findById(documentId)
                .orElseThrow(() -> new IllegalArgumentException("Dokumen tidak ditemukan"));
        if ("approve".equalsIgnoreCase(action)) {
            document.setVerificationStatus("valid");
            document.setAdminNotes(blankToNull(notes));
        } else if ("reject".equalsIgnoreCase(action)) {
            if (notes == null || notes.isBlank()) throw new IllegalArgumentException("Alasan penolakan dokumen wajib diisi");
            document.setVerificationStatus("invalid");
            document.setAdminNotes(notes.trim());
        } else {
            throw new IllegalArgumentException("Aksi verifikasi dokumen tidak valid");
        }
        documentRepository.save(document);
        BarberRegistration registration = document.getRegistration();
        registration.setStatus("under_review");
        registration.setReviewedBy(admin);
        registration.setReviewedAt(LocalDateTime.now());
        registration.setUpdatedAt(LocalDateTime.now());
        auditService.record("VERIFY_DOCUMENT_" + action.toUpperCase(), "REGISTRATION_DOCUMENT", document.getId(), notes);
        return toResponse(registrationRepository.save(registration));
    }

    private void activateStaffRegistration(BarberRegistration registration, User barber, LocalDateTime now) {
        Barbershop shop = registration.getTargetBarbershop();
        BarberProfile profile = barberProfileRepository.findByUser_Id(barber.getId()).orElseGet(BarberProfile::new);
        profile.setUser(barber);
        profile.setBarberType("employee");
        profile.setBarbershop(shop);
        profile.setBaseAddress(shop.getBusinessAddress());
        profile.setBaseLatitude(shop.getLatitude());
        profile.setBaseLongitude(shop.getLongitude());
        profile.setServiceRadiusKm(shop.getServiceRadiusKm() == null ? BigDecimal.TEN : shop.getServiceRadiusKm());
        profile.setVerificationStatus("verified");
        profile.setAvailabilityStatus("available");
        if (profile.getRatingAverage() == null) profile.setRatingAverage(BigDecimal.ZERO);
        if (profile.getTotalCompleted() == null) profile.setTotalCompleted(0);
        profile.setUpdatedAt(now);
        if (profile.getCreatedAt() == null) profile.setCreatedAt(now);
        barberProfileRepository.save(profile);

        BarbershopStaff staff = staffRepository.findByBarbershop_IdAndBarber_IdAndEmploymentStatus(shop.getId(), barber.getId(), "active")
                .orElseGet(BarbershopStaff::new);
        staff.setBarbershop(shop);
        staff.setBarber(barber);
        staff.setAddedBy(shop.getOwner());
        staff.setPosition("Barber");
        staff.setEmploymentStatus("active");
        staff.setJoinedAt(now);
        staff.setCreatedAt(staff.getCreatedAt() == null ? now : staff.getCreatedAt());
        staff.setUpdatedAt(now);
        staffRepository.save(staff);
        barber.setStatus("active");
        barber.setUpdatedAt(now);
        userRepository.save(barber);
    }

    private String hashToken(String token) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256").digest(token.getBytes(StandardCharsets.UTF_8));
            StringBuilder result = new StringBuilder();
            for (byte value : digest) result.append(String.format("%02x", value));
            return result.toString();
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("Hash token tidak tersedia", exception);
        }
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
