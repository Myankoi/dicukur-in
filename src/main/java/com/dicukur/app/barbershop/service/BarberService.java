package com.dicukur.app.barbershop.service;

import com.dicukur.app.barbershop.dto.*;
import com.dicukur.app.barbershop.entity.BarberProfile;
import com.dicukur.app.barbershop.entity.BarberSchedule;
import com.dicukur.app.barbershop.entity.BarberTimeOff;
import com.dicukur.app.barbershop.repository.BarberProfileRepository;
import com.dicukur.app.barbershop.repository.BarberScheduleRepository;
import com.dicukur.app.barbershop.repository.BarberTimeOffRepository;
import com.dicukur.app.barbershop.entity.Barbershop;
import com.dicukur.app.barbershop.entity.BarbershopStaff;
import com.dicukur.app.barbershop.repository.BarbershopStaffRepository;
import com.dicukur.app.booking.entity.Booking;
import com.dicukur.app.booking.repository.BookingRepository;
import com.dicukur.app.notification.service.NotificationService;
import com.dicukur.app.payment.repository.PaymentRepository;
import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Set;

@Service
public class BarberService {

    private static final Set<String> ACTIVE_BOOKING_STATUSES = Set.of(
            "pending", "accepted", "on_the_way", "arrived", "in_progress"
    );

    private final BarberScheduleRepository scheduleRepository;
    private final BarberTimeOffRepository timeOffRepository;
    private final BarberProfileRepository profileRepository;
    private final BookingRepository bookingRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;
    private final BarbershopStaffRepository staffRepository;
    private final PaymentRepository paymentRepository;

    public BarberService(BarberScheduleRepository scheduleRepository,
                         BarberTimeOffRepository timeOffRepository,
                         BarberProfileRepository profileRepository,
                         BookingRepository bookingRepository,
                         CurrentUserService currentUserService,
                         NotificationService notificationService,
                         BarbershopStaffRepository staffRepository,
                         PaymentRepository paymentRepository) {
        this.scheduleRepository = scheduleRepository;
        this.timeOffRepository = timeOffRepository;
        this.profileRepository = profileRepository;
        this.bookingRepository = bookingRepository;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
        this.staffRepository = staffRepository;
        this.paymentRepository = paymentRepository;
    }

    // ======================== SCHEDULE CRUD ========================

    @Transactional(readOnly = true)
    public List<BarberScheduleResponse> getMySchedules() {
        User barber = currentUserService.requireRole("Barber");
        return scheduleRepository.findByBarber_Id(barber.getId())
                .stream().map(this::toScheduleResponse).toList();
    }

    @Transactional
    public BarberScheduleResponse saveSchedule(BarberScheduleRequest request) {
        User barber = currentUserService.requireRole("Barber");

        if (request.startTime() == null || request.endTime() == null) {
            throw new IllegalArgumentException("Jam mulai dan jam selesai wajib diisi");
        }
        LocalTime start = LocalTime.parse(request.startTime());
        LocalTime end = LocalTime.parse(request.endTime());
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("Jam selesai harus lebih besar dari jam mulai");
        }

        BarberSchedule schedule;
        if (request.id() != null) {
            schedule = scheduleRepository.findById(request.id())
                    .filter(s -> s.getBarber().getId().equals(barber.getId()))
                    .orElseThrow(() -> new IllegalArgumentException("Jadwal tidak ditemukan"));
        } else {
            schedule = new BarberSchedule();
            schedule.setBarber(barber);
        }

        schedule.setDayOfWeek(request.dayOfWeek());
        schedule.setStartTime(start);
        schedule.setEndTime(end);
        schedule.setStatus(request.status() != null ? request.status() : "active");

        return toScheduleResponse(scheduleRepository.save(schedule));
    }

    @Transactional
    public void deleteSchedule(Long id) {
        User barber = currentUserService.requireRole("Barber");
        BarberSchedule schedule = scheduleRepository.findById(id)
                .filter(s -> s.getBarber().getId().equals(barber.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Jadwal tidak ditemukan"));
        scheduleRepository.delete(schedule);
    }

    // ======================== TIME OFF CRUD ========================

    @Transactional(readOnly = true)
    public List<BarberTimeOffResponse> getMyTimeOffs() {
        User barber = currentUserService.requireRole("Barber");
        return timeOffRepository.findByBarber_IdOrderByStartDatetimeDesc(barber.getId())
                .stream().map(this::toTimeOffResponse).toList();
    }

    @Transactional
    public BarberTimeOffResponse saveTimeOff(BarberTimeOffRequest request) {
        User barber = currentUserService.requireRole("Barber");

        LocalDateTime start = LocalDateTime.parse(request.startDatetime());
        LocalDateTime end = LocalDateTime.parse(request.endDatetime());
        if (!end.isAfter(start)) {
            throw new IllegalArgumentException("Waktu selesai harus lebih besar dari waktu mulai");
        }

        BarberTimeOff timeOff;
        if (request.id() != null) {
            timeOff = timeOffRepository.findById(request.id())
                    .filter(t -> t.getBarber().getId().equals(barber.getId()))
                    .orElseThrow(() -> new IllegalArgumentException("Time off tidak ditemukan"));
        } else {
            timeOff = new BarberTimeOff();
            timeOff.setBarber(barber);
        }

        timeOff.setStartDatetime(start);
        timeOff.setEndDatetime(end);

        return toTimeOffResponse(timeOffRepository.save(timeOff));
    }

    @Transactional
    public void deleteTimeOff(Long id) {
        User barber = currentUserService.requireRole("Barber");
        BarberTimeOff timeOff = timeOffRepository.findById(id)
                .filter(t -> t.getBarber().getId().equals(barber.getId()))
                .orElseThrow(() -> new IllegalArgumentException("Time off tidak ditemukan"));
        timeOffRepository.delete(timeOff);
    }

    // ======================== BOOKING MANAGEMENT ========================

    @Transactional(readOnly = true)
    public List<BarberBookingResponse> getIncomingBookings() {
        User barber = currentUserService.requireRole("Barber");
        return bookingRepository.findByBarber_IdAndStatusInOrderByStartDatetimeAsc(
                        barber.getId(), List.of("pending", "accepted", "on_the_way", "arrived", "in_progress"))
                .stream().map(this::toBarberBookingResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<BarberBookingResponse> getBookingHistory() {
        User barber = currentUserService.requireRole("Barber");
        return bookingRepository.findByBarber_IdAndStatusInOrderByStartDatetimeDesc(
                        barber.getId(), List.of("completed", "rejected",
                                "cancelled_by_customer", "cancelled_by_barber", "cancelled_by_admin", "no_show"))
                .stream().map(this::toBarberBookingResponse).toList();
    }

    @Transactional
    public BarberBookingResponse acceptBooking(Long bookingId) {
        User barber = currentUserService.requireRole("Barber");
        Booking booking = requireBarberBooking(barber.getId(), bookingId);

        if (!"pending".equals(booking.getStatus())) {
            throw new IllegalArgumentException("Booking ini tidak dalam status menunggu konfirmasi");
        }

        booking.setStatus("accepted");
        booking.setPaymentDeadline(LocalDateTime.now().plusMinutes(30));
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        // Notify customer
        notificationService.createNotification(
                booking.getCustomer().getId(),
                "Booking Diterima ✅",
                "Barber " + barber.getName() + " telah menerima pesanan #" + booking.getBookingCode() + ". Silakan tunggu barber menuju lokasimu.",
                "booking_accepted",
                booking.getId()
        );

        return toBarberBookingResponse(saved);
    }

    @Transactional
    public BarberBookingResponse rejectBooking(Long bookingId, String reason) {
        User barber = currentUserService.requireRole("Barber");
        Booking booking = requireBarberBooking(barber.getId(), bookingId);

        if (!"pending".equals(booking.getStatus())) {
            throw new IllegalArgumentException("Booking ini tidak dalam status menunggu konfirmasi");
        }

        booking.setStatus("rejected");
        booking.setCancellationReason(reason != null && !reason.isBlank() ? reason.trim() : null);
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        // Notify customer
        String rejectMsg = "Barber " + barber.getName() + " menolak pesanan #" + booking.getBookingCode() + ".";
        if (reason != null && !reason.isBlank()) {
            rejectMsg += " Alasan: " + reason.trim();
        }
        notificationService.createNotification(
                booking.getCustomer().getId(),
                "Booking Ditolak ❌",
                rejectMsg,
                "booking_rejected",
                booking.getId()
        );

        return toBarberBookingResponse(saved);
    }

    @Transactional
    public BarberBookingResponse cancelBooking(Long bookingId, String reason) {
        User barber = currentUserService.requireRole("Barber");
        Booking booking = requireBarberBooking(barber.getId(), bookingId);
        if (!Set.of("accepted", "on_the_way").contains(booking.getStatus())) {
            throw new IllegalStateException("Booking hanya dapat dibatalkan sebelum barber tiba di lokasi");
        }
        booking.setStatus("cancelled_by_barber");
        booking.setCancellationReason(reason == null || reason.isBlank()
                ? "Dibatalkan oleh barber karena kendala operasional" : reason.trim());
        if ("paid".equalsIgnoreCase(booking.getPaymentStatus())) {
            booking.setPaymentStatus("refund_pending");
            paymentRepository.findByBooking_Id(booking.getId()).ifPresent(payment -> {
                payment.setStatus("refund_pending");
                payment.setRefundReason(booking.getCancellationReason());
                payment.setUpdatedAt(LocalDateTime.now());
                paymentRepository.save(payment);
            });
        } else {
            booking.setPaymentStatus("unpaid");
            paymentRepository.findByBooking_Id(booking.getId()).ifPresent(payment -> {
                payment.setStatus("cancelled");
                payment.setUpdatedAt(LocalDateTime.now());
                paymentRepository.save(payment);
            });
        }
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        notificationService.createNotification(booking.getCustomer().getId(), "Booking dibatalkan barber",
                "Booking #" + booking.getBookingCode() + " dibatalkan oleh barber. "
                        + ("refund_pending".equalsIgnoreCase(booking.getPaymentStatus())
                        ? "Refund menunggu diproses admin." : ""),
                "booking_cancelled", booking.getId());
        return toBarberBookingResponse(saved);
    }

    @Transactional
    public BarberBookingResponse updateBookingStatus(Long bookingId, String newStatus) {
        User barber = currentUserService.requireRole("Barber");
        Booking booking = requireBarberBooking(barber.getId(), bookingId);

        validateStatusTransition(booking.getStatus(), newStatus);

        if ("on_the_way".equals(newStatus)) {
            throw new IllegalStateException("Gunakan tombol berangkat agar lokasi GPS tersimpan dan customer dapat melakukan tracking");
        }

        booking.setStatus(newStatus);
        if ("cancelled_by_barber".equalsIgnoreCase(newStatus)
                && "paid".equalsIgnoreCase(booking.getPaymentStatus())) {
            booking.setPaymentStatus("refund_pending");
            paymentRepository.findByBooking_Id(booking.getId()).ifPresent(payment -> {
                payment.setStatus("refund_pending");
                payment.setRefundReason(booking.getCancellationReason());
                payment.setUpdatedAt(LocalDateTime.now());
                paymentRepository.save(payment);
            });
        }
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        // Notify customer about status update
        String statusLabel = switch (newStatus) {
            case "on_the_way" -> "Barber sedang dalam perjalanan menuju lokasimu 🚗";
            case "arrived" -> "Barber telah tiba di lokasi 📍";
            case "in_progress" -> "Proses cukur sedang berlangsung ✂️";
            case "completed" -> "Cukur selesai! Terima kasih telah menggunakan dicukur.in 🎉";
            default -> "Status booking diperbarui ke: " + newStatus;
        };
        notificationService.createNotification(
                booking.getCustomer().getId(),
                "Update Booking #" + booking.getBookingCode(),
                statusLabel,
                "booking_status",
                booking.getId()
        );

        return toBarberBookingResponse(saved);
    }

    @Transactional
    public BarberBookingResponse startTrip(Long bookingId, BigDecimal latitude, BigDecimal longitude,
                                           BigDecimal accuracy) {
        User barber = currentUserService.requireRole("Barber");
        Booking booking = requireBarberBooking(barber.getId(), bookingId);
        if (!"accepted".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Booking belum siap untuk diberangkatkan");
        }
        if (!"paid".equalsIgnoreCase(booking.getPaymentStatus())) {
            throw new IllegalStateException("Customer harus melunasi pembayaran sebelum barber berangkat");
        }
        validateCoordinates(latitude, longitude);
        booking.setBarberLatitude(latitude);
        booking.setBarberLongitude(longitude);
        booking.setLocationAccuracy(accuracy);
        booking.setLocationUpdatedAt(LocalDateTime.now());
        booking.setStatus("on_the_way");
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);
        notificationService.createNotification(
                booking.getCustomer().getId(), "Barber sedang berangkat 🚗",
                "Barber " + barber.getName() + " sedang menuju lokasi booking #" + booking.getBookingCode() + ".",
                "booking_status", booking.getId());
        return toBarberBookingResponse(saved);
    }

    // ======================== DASHBOARD ========================

    @Transactional(readOnly = true)
    public BarberDashboardResponse getDashboardSummary() {
        User barber = currentUserService.requireRole("Barber");

        long pendingCount = bookingRepository.countByBarber_IdAndStatus(barber.getId(), "pending");
        long todayCompleted = bookingRepository.countByBarber_IdAndStatusAndStartDatetimeBetween(
                barber.getId(), "completed",
                LocalDateTime.now().toLocalDate().atStartOfDay(),
                LocalDateTime.now().toLocalDate().plusDays(1).atStartOfDay());
        long totalCompleted = bookingRepository.countByBarber_IdAndStatus(barber.getId(), "completed");

        BigDecimal totalEarnings = bookingRepository.sumTotalPriceByBarber_IdAndStatus(barber.getId(), "completed");
        if (totalEarnings == null) totalEarnings = BigDecimal.ZERO;

        BarberProfile profile = profileRepository.findByUser_Id(barber.getId()).orElse(null);
        BigDecimal avgRating = profile != null ? profile.getRatingAverage() : BigDecimal.ZERO;

        return new BarberDashboardResponse(
                pendingCount, todayCompleted, totalCompleted,
                totalEarnings.setScale(0, RoundingMode.HALF_UP),
                avgRating
        );
    }

    // ======================== PROFILE ========================

    @Transactional(readOnly = true)
    public BarberProfileResponse getMyProfile() {
        User barber = currentUserService.requireRole("Barber");
        BarberProfile profile = profileRepository.findByUser_Id(barber.getId()).orElse(null);
        return toProfileResponse(barber, profile);
    }

    @Transactional
    public BarberProfileResponse updateMyProfile(BarberProfileUpdateRequest request) {
        User barber = currentUserService.requireRole("Barber");
        BarberProfile profile = profileRepository.findByUser_Id(barber.getId())
                .orElseGet(() -> createDefaultProfile(barber));

        if (request.bio() != null) profile.setBio(request.bio().isBlank() ? null : request.bio().trim());
        if (request.experienceYears() != null) profile.setExperienceYears(request.experienceYears());
        if (request.baseAddress() != null) profile.setBaseAddress(request.baseAddress().isBlank() ? null : request.baseAddress().trim());
        if (request.baseLatitude() != null) profile.setBaseLatitude(request.baseLatitude());
        if (request.baseLongitude() != null) profile.setBaseLongitude(request.baseLongitude());
        profile.setUpdatedAt(LocalDateTime.now());

        if (request.name() != null && !request.name().isBlank()) {
            barber.setName(request.name().trim());
            barber.setUpdatedAt(LocalDateTime.now());
        }
        if (request.phone() != null && !request.phone().isBlank()) {
            barber.setPhone(request.phone().trim());
            barber.setUpdatedAt(LocalDateTime.now());
        }
        if (request.photo() != null && !request.photo().isBlank()) {
            barber.setPhoto(request.photo().trim());
            barber.setUpdatedAt(LocalDateTime.now());
        }

        return toProfileResponse(barber, profileRepository.save(profile));
    }

    @Transactional
    public BarberProfileResponse toggleAvailability() {
        User barber = currentUserService.requireRole("Barber");
        BarberProfile profile = profileRepository.findByUser_Id(barber.getId())
                .orElseGet(() -> createDefaultProfile(barber));
        profile.setAvailabilityStatus("available".equalsIgnoreCase(profile.getAvailabilityStatus()) ? "unavailable" : "available");
        profile.setUpdatedAt(LocalDateTime.now());
        return toProfileResponse(barber, profileRepository.save(profile));
    }

    // ======================== HELPERS ========================

    private Booking requireBarberBooking(Long barberId, Long bookingId) {
        return bookingRepository.findByBarber_IdAndId(barberId, bookingId)
                .orElseThrow(() -> new IllegalArgumentException("Booking tidak ditemukan"));
    }

    private void validateStatusTransition(String current, String next) {
        boolean valid = switch (current) {
            case "accepted" -> "on_the_way".equals(next) || "cancelled_by_barber".equals(next);
            case "on_the_way" -> "arrived".equals(next) || "cancelled_by_barber".equals(next);
            case "arrived" -> "in_progress".equals(next) || "no_show".equals(next);
            case "in_progress" -> "completed".equals(next);
            default -> false;
        };

        if (!valid) {
            throw new IllegalArgumentException(
                    String.format("Tidak bisa mengubah status dari '%s' ke '%s'", current, next));
        }
    }

    private BarberScheduleResponse toScheduleResponse(BarberSchedule schedule) {
        return new BarberScheduleResponse(
                schedule.getId(),
                schedule.getDayOfWeek(),
                schedule.getStartTime().toString(),
                schedule.getEndTime().toString(),
                schedule.getStatus()
        );
    }

    private BarberTimeOffResponse toTimeOffResponse(BarberTimeOff timeOff) {
        return new BarberTimeOffResponse(
                timeOff.getId(),
                timeOff.getStartDatetime().toString(),
                timeOff.getEndDatetime().toString()
        );
    }

    @Transactional
    public BarberBookingResponse updateLiveLocation(Long bookingId, BigDecimal latitude, BigDecimal longitude) {
        return updateLiveLocation(bookingId, latitude, longitude, null);
    }

    @Transactional
    public BarberBookingResponse updateLiveLocation(Long bookingId, BigDecimal latitude, BigDecimal longitude,
                                                    BigDecimal accuracy) {
        User barber = currentUserService.requireRole("Barber");
        Booking booking = requireBarberBooking(barber.getId(), bookingId);
        if (!"on_the_way".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Lokasi live hanya dapat diperbarui saat barber dalam perjalanan");
        }
        validateCoordinates(latitude, longitude);
        booking.setBarberLatitude(latitude);
        booking.setBarberLongitude(longitude);
        booking.setLocationAccuracy(accuracy);
        booking.setLocationUpdatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

        return toBarberBookingResponse(saved);
    }

    private BarberBookingResponse toBarberBookingResponse(Booking booking) {
        return new BarberBookingResponse(
                booking.getId(),
                booking.getBookingCode(),
                booking.getCustomer().getName(),
                booking.getCustomer().getPhone(),
                booking.getDetails().isEmpty() ? "Layanan" : booking.getDetails().get(0).getServiceName(),
                booking.getStartDatetime().toString(),
                booking.getEndDatetime().toString(),
                booking.getAddressSnapshot(),
                booking.getCustomerLatitude(),
                booking.getCustomerLongitude(),
                booking.getBarberLatitude(),
                booking.getBarberLongitude(),
                booking.getDistanceKm(),
                booking.getTotalPrice(),
                booking.getStatus(),
                booking.getPaymentStatus(),
                booking.getNotes(),
                booking.getCancellationReason(),
                booking.getPaymentDeadline() != null ? booking.getPaymentDeadline().toString() : null,
                booking.getLocationUpdatedAt() != null ? booking.getLocationUpdatedAt().toString() : null,
                booking.getDetails().stream().map(d -> new com.dicukur.app.booking.dto.BookingDetailResponse(
                        d.getId(), d.getParticipantName() == null ? "Peserta" : d.getParticipantName(),
                        d.getSequenceNumber() == null ? 1 : d.getSequenceNumber(),
                        d.getService() != null ? d.getService().getId() : null,
                        d.getServiceName(), d.getPrice(), d.getDuration(), d.getSubtotal())).toList()
        );
    }

    private void validateCoordinates(BigDecimal latitude, BigDecimal longitude) {
        if (latitude == null || longitude == null
                || latitude.compareTo(BigDecimal.valueOf(-90)) < 0 || latitude.compareTo(BigDecimal.valueOf(90)) > 0
                || longitude.compareTo(BigDecimal.valueOf(-180)) < 0 || longitude.compareTo(BigDecimal.valueOf(180)) > 0) {
            throw new IllegalArgumentException("Koordinat GPS tidak valid");
        }
    }

    private BarberProfileResponse toProfileResponse(User barber, BarberProfile profile) {
        BarbershopStaff staff = staffRepository != null ? staffRepository.findFirstByBarber_Id(barber.getId()).orElse(null) : null;
        Barbershop shop = staff != null ? staff.getBarbershop() : null;

        return new BarberProfileResponse(
                barber.getName(),
                barber.getEmail(),
                barber.getPhone(),
                profile != null ? profile.getBio() : null,
                profile != null && profile.getExperienceYears() != null ? profile.getExperienceYears() : 0,
                profile != null ? profile.getBaseAddress() : null,
                profile != null ? profile.getBaseLatitude() : BigDecimal.valueOf(-6.2088),
                profile != null ? profile.getBaseLongitude() : BigDecimal.valueOf(106.8456),
                profile != null && profile.getServiceRadiusKm() != null ? profile.getServiceRadiusKm() : BigDecimal.TEN,
                profile != null && profile.getVerificationStatus() != null ? profile.getVerificationStatus() : "pending",
                profile != null && profile.getAvailabilityStatus() != null ? profile.getAvailabilityStatus() : "available",
                profile != null && profile.getRatingAverage() != null ? profile.getRatingAverage() : BigDecimal.ZERO,
                profile != null && profile.getTotalCompleted() != null ? profile.getTotalCompleted() : 0,
                barber.getPhoto(),
                shop != null ? shop.getName() : "Mitra Barbershop Resmi",
                shop != null ? shop.getBusinessAddress() : "Lokasi Operasional Mitra"
        );
    }

    private BarberProfile createDefaultProfile(User barber) {
        BarberProfile profile = new BarberProfile();
        profile.setUser(barber);
        profile.setBarberType("employee");
        profile.setBaseLatitude(BigDecimal.valueOf(-6.2088));
        profile.setBaseLongitude(BigDecimal.valueOf(106.8456));
        profile.setServiceRadiusKm(BigDecimal.TEN);
        profile.setVerificationStatus("pending");
        profile.setAvailabilityStatus("available");
        profile.setRatingAverage(BigDecimal.ZERO);
        profile.setTotalCompleted(0);
        profile.setCreatedAt(LocalDateTime.now());
        profile.setUpdatedAt(LocalDateTime.now());
        return profile;
    }
}
