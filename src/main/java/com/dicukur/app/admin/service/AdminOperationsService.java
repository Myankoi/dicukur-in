package com.dicukur.app.admin.service;

import com.dicukur.app.admin.dto.AdminBarbershopResponse;
import com.dicukur.app.admin.dto.PricingRuleRequest;
import com.dicukur.app.admin.dto.PricingRuleResponse;
import com.dicukur.app.barbershop.entity.BarberProfile;
import com.dicukur.app.barbershop.entity.Barbershop;
import com.dicukur.app.barbershop.repository.BarberProfileRepository;
import com.dicukur.app.barbershop.repository.BarbershopRepository;
import com.dicukur.app.barbershop.repository.BarbershopStaffRepository;
import com.dicukur.app.booking.entity.Booking;
import com.dicukur.app.booking.repository.BookingRepository;
import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.service.entity.PricingRule;
import com.dicukur.app.service.repository.PricingRuleRepository;
import com.dicukur.app.user.entity.User;
import com.dicukur.app.user.dto.UserResponse;
import com.dicukur.app.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class AdminOperationsService {
    private final BarbershopRepository barbershopRepository;
    private final BarbershopStaffRepository staffRepository;
    private final BookingRepository bookingRepository;
    private final BarberProfileRepository profileRepository;
    private final UserRepository userRepository;
    private final PricingRuleRepository pricingRuleRepository;
    private final CurrentUserService currentUserService;
    private final AdminAuditService auditService;

    public AdminOperationsService(BarbershopRepository barbershopRepository, BarbershopStaffRepository staffRepository,
                                  BookingRepository bookingRepository, BarberProfileRepository profileRepository,
                                  UserRepository userRepository, PricingRuleRepository pricingRuleRepository,
                                  CurrentUserService currentUserService, AdminAuditService auditService) {
        this.barbershopRepository = barbershopRepository; this.staffRepository = staffRepository;
        this.bookingRepository = bookingRepository; this.profileRepository = profileRepository;
        this.userRepository = userRepository; this.pricingRuleRepository = pricingRuleRepository;
        this.currentUserService = currentUserService;
        this.auditService = auditService;
    }

    @Transactional(readOnly = true)
    public List<AdminBarbershopResponse> getBarbershops() {
        currentUserService.requireRole("Admin");
        return barbershopRepository.findAll().stream().map(shop -> new AdminBarbershopResponse(
                shop.getId(), shop.getName(), shop.getOwner() != null ? shop.getOwner().getName() : "-",
                shop.getOwner() != null ? shop.getOwner().getEmail() : "-", shop.getCity(),
                shop.getVerificationStatus(), shop.getStatus(), staffRepository.findByBarbershop_IdAndEmploymentStatus(shop.getId(), "active").size(),
                bookingRepository.countByBarbershop_Id(shop.getId()), shop.getRatingAverage())).toList();
    }

    @Transactional
    public AdminBarbershopResponse toggleBarbershopStatus(Long id) {
        currentUserService.requireRole("Admin");
        Barbershop shop = barbershopRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Barbershop tidak ditemukan"));
        if (!"active".equalsIgnoreCase(shop.getStatus())
                && !"approved".equalsIgnoreCase(shop.getVerificationStatus())) {
            throw new IllegalStateException("Barbershop belum disetujui admin dan belum dapat diaktifkan");
        }
        shop.setStatus("active".equalsIgnoreCase(shop.getStatus()) ? "suspended" : "active");
        shop.setUpdatedAt(LocalDateTime.now());
        barbershopRepository.save(shop);
        auditService.record("TOGGLE_BARBERSHOP_STATUS", "BARBERSHOP", shop.getId(), shop.getStatus());
        return getBarbershops().stream().filter(item -> item.id().equals(id)).findFirst().orElseThrow();
    }

    @Transactional(readOnly = true)
    public List<PricingRuleResponse> getPricingRules() {
        currentUserService.requireRole("Admin");
        return pricingRuleRepository.findAll().stream().map(this::toPricing).toList();
    }

    @Transactional
    public PricingRuleResponse savePricingRule(Long id, PricingRuleRequest request) {
        currentUserService.requireRole("Admin");
        PricingRule rule = id == null ? new PricingRule() : pricingRuleRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Aturan ongkir tidak ditemukan"));
        rule.setName(request.name().trim()); rule.setFreeRadiusKm(request.freeRadiusKm()); rule.setPricePerKm(request.pricePerKm());
        rule.setMinimumTravelFee(request.minimumTravelFee()); rule.setMaximumTravelFee(request.maximumTravelFee());
        if (rule.getStatus() == null) rule.setStatus("inactive");
        PricingRule saved = pricingRuleRepository.save(rule);
        auditService.record("SAVE_PRICING_RULE", "PRICING_RULE", saved.getId(), saved.getName());
        return toPricing(saved);
    }

    @Transactional
    public PricingRuleResponse togglePricingRule(Long id) {
        currentUserService.requireRole("Admin");
        PricingRule rule = pricingRuleRepository.findById(id).orElseThrow(() -> new IllegalArgumentException("Aturan ongkir tidak ditemukan"));
        rule.setStatus("active".equalsIgnoreCase(rule.getStatus()) ? "inactive" : "active");
        PricingRule saved = pricingRuleRepository.save(rule);
        auditService.record("TOGGLE_PRICING_RULE", "PRICING_RULE", saved.getId(), saved.getStatus());
        return toPricing(saved);
    }

    @Transactional
    public void reassignBooking(Long bookingId, Long barberId) {
        currentUserService.requireRole("Admin");
        Booking booking = bookingRepository.findById(bookingId).orElseThrow(() -> new IllegalArgumentException("Booking tidak ditemukan"));
        if (List.of("on_the_way", "arrived", "in_progress", "completed").contains(booking.getStatus())) throw new IllegalStateException("Booking sudah berjalan dan tidak dapat dialihkan");
        User barber = userRepository.findById(barberId).orElseThrow(() -> new IllegalArgumentException("Barber tidak ditemukan"));
        if (barber.getRole() == null || !"Barber".equalsIgnoreCase(barber.getRole().getName())) throw new IllegalArgumentException("User tujuan bukan barber");
        BarberProfile barberProfile = profileRepository.findByUser_Id(barberId).orElse(null);
        if (!"active".equalsIgnoreCase(barber.getStatus()) || barberProfile == null
                || !"verified".equalsIgnoreCase(barberProfile.getVerificationStatus())) {
            throw new IllegalArgumentException("Barber tujuan belum aktif atau belum diverifikasi");
        }
        if (booking.getBarbershop() != null && staffRepository.findByBarbershop_IdAndBarber_IdAndEmploymentStatus(booking.getBarbershop().getId(), barberId, "active").isEmpty()) throw new IllegalArgumentException("Barber bukan staf aktif barbershop ini");
        if (bookingRepository.existsOverlapping(barberId, booking.getStartDatetime(), booking.getEndDatetime(), List.of("pending", "accepted", "on_the_way", "arrived", "in_progress"))) throw new IllegalStateException("Jadwal barber tujuan bentrok");
        booking.setBarber(barber); booking.setStatus("pending"); booking.setPaymentDeadline(null); booking.setUpdatedAt(LocalDateTime.now());
        BarberProfile profile = profileRepository.findByUser_Id(barberId).orElse(null);
        if (profile != null) { booking.setBarberLatitude(profile.getBaseLatitude()); booking.setBarberLongitude(profile.getBaseLongitude()); booking.setBarberBaseSnapshot(profile.getBaseAddress()); }
        bookingRepository.save(booking);
        auditService.record("REASSIGN_BOOKING", "BOOKING", booking.getId(), "Barber baru: " + barber.getId());
    }

    @Transactional(readOnly = true)
    public List<UserResponse> getAssignableBarbers() {
        currentUserService.requireRole("Admin");
        return userRepository.findByRole_NameOrderByCreatedAtDesc("Barber").stream()
                .filter(user -> "active".equalsIgnoreCase(user.getStatus()))
                .filter(user -> profileRepository.findByUser_Id(user.getId())
                        .map(profile -> "verified".equalsIgnoreCase(profile.getVerificationStatus())
                                && ("independent".equalsIgnoreCase(profile.getBarberType())
                                || !staffRepository.findByBarber_Id(user.getId()).isEmpty()))
                        .orElse(false))
                .map(this::toUserResponse)
                .toList();
    }

    private PricingRuleResponse toPricing(PricingRule rule) { return new PricingRuleResponse(rule.getId(), rule.getName(), rule.getFreeRadiusKm(), rule.getPricePerKm(), rule.getMinimumTravelFee(), rule.getMaximumTravelFee(), rule.getStatus()); }

    private UserResponse toUserResponse(User user) {
        return new UserResponse(user.getId(), user.getName(), user.getEmail(), user.getPhone(),
                user.getRole() != null ? user.getRole().getName() : "-", user.getStatus(), user.getNotes(),
                user.getCreatedAt() != null ? user.getCreatedAt().toString() : null,
                user.getUpdatedAt() != null ? user.getUpdatedAt().toString() : null);
    }
}
