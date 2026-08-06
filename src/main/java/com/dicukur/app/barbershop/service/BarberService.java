package com.dicukur.app.barbershop.service;

import com.dicukur.app.barbershop.dto.*;
import com.dicukur.app.barbershop.entity.BarberProfile;
import com.dicukur.app.barbershop.entity.BarberSchedule;
import com.dicukur.app.barbershop.entity.BarberTimeOff;
import com.dicukur.app.barbershop.repository.BarberProfileRepository;
import com.dicukur.app.barbershop.repository.BarberScheduleRepository;
import com.dicukur.app.barbershop.repository.BarberTimeOffRepository;
import com.dicukur.app.booking.entity.Booking;
import com.dicukur.app.booking.repository.BookingRepository;
import com.dicukur.app.notification.service.NotificationService;
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

    public BarberService(BarberScheduleRepository scheduleRepository,
                         BarberTimeOffRepository timeOffRepository,
                         BarberProfileRepository profileRepository,
                         BookingRepository bookingRepository,
                         CurrentUserService currentUserService,
                         NotificationService notificationService) {
        this.scheduleRepository = scheduleRepository;
        this.timeOffRepository = timeOffRepository;
        this.profileRepository = profileRepository;
        this.bookingRepository = bookingRepository;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
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
    public BarberBookingResponse updateBookingStatus(Long bookingId, String newStatus) {
        User barber = currentUserService.requireRole("Barber");
        Booking booking = requireBarberBooking(barber.getId(), bookingId);

        validateStatusTransition(booking.getStatus(), newStatus);

        booking.setStatus(newStatus);
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
        BarberProfile profile = profileRepository.findByUser_Id(barber.getId())
                .orElseThrow(() -> new IllegalStateException("Profil barber belum tersedia"));
        return toProfileResponse(barber, profile);
    }

    @Transactional
    public BarberProfileResponse updateMyProfile(BarberProfileUpdateRequest request) {
        User barber = currentUserService.requireRole("Barber");
        BarberProfile profile = profileRepository.findByUser_Id(barber.getId())
                .orElseThrow(() -> new IllegalStateException("Profil barber belum tersedia"));

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
                booking.getDistanceKm(),
                booking.getTotalPrice(),
                booking.getStatus(),
                booking.getPaymentStatus(),
                booking.getNotes(),
                booking.getCancellationReason()
        );
    }

    private BarberProfileResponse toProfileResponse(User barber, BarberProfile profile) {
        return new BarberProfileResponse(
                barber.getName(),
                barber.getEmail(),
                barber.getPhone(),
                profile.getBio(),
                profile.getExperienceYears(),
                profile.getBaseAddress(),
                profile.getBaseLatitude(),
                profile.getBaseLongitude(),
                profile.getServiceRadiusKm(),
                profile.getVerificationStatus(),
                profile.getAvailabilityStatus(),
                profile.getRatingAverage(),
                profile.getTotalCompleted()
        );
    }
}
