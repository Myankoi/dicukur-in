package com.dicukur.app.booking.service;

import com.dicukur.app.address.entity.CustomerAddress;
import com.dicukur.app.address.repository.CustomerAddressRepository;
import com.dicukur.app.barbershop.entity.BarberProfile;
import com.dicukur.app.barbershop.entity.BarberSchedule;
import com.dicukur.app.barbershop.entity.Barbershop;
import com.dicukur.app.barbershop.repository.BarberProfileRepository;
import com.dicukur.app.barbershop.repository.BarberScheduleRepository;
import com.dicukur.app.barbershop.repository.BarberTimeOffRepository;
import com.dicukur.app.barbershop.repository.BarbershopRepository;
import com.dicukur.app.barbershop.repository.BarbershopStaffRepository;
import com.dicukur.app.booking.dto.BookingRequest;
import com.dicukur.app.booking.dto.BookingItemRequest;
import com.dicukur.app.booking.dto.BookingDetailResponse;
import com.dicukur.app.booking.dto.BookingResponse;
import com.dicukur.app.booking.entity.Booking;
import com.dicukur.app.booking.entity.BookingDetail;
import com.dicukur.app.booking.repository.BookingRepository;
import com.dicukur.app.common.location.GeoDistance;
import com.dicukur.app.notification.service.NotificationService;
import com.dicukur.app.payment.entity.Payment;
import com.dicukur.app.payment.repository.PaymentRepository;
import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.service.entity.BarbershopService;
import com.dicukur.app.service.entity.PricingRule;
import com.dicukur.app.service.entity.ServiceOffering;
import com.dicukur.app.service.repository.BarbershopServiceRepository;
import com.dicukur.app.service.repository.PricingRuleRepository;
import com.dicukur.app.service.repository.ServiceOfferingRepository;
import com.dicukur.app.user.entity.User;
import com.dicukur.app.user.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;
import java.util.ArrayList;
import java.util.Set;
import java.util.UUID;

@Service
public class BookingService {

    private static final Set<String> BLOCKING_STATUSES = Set.of(
            "pending", "accepted", "on_the_way", "arrived", "in_progress"
    );

    private final BookingRepository bookingRepository;
    private final CustomerAddressRepository addressRepository;
    private final BarbershopRepository barbershopRepository;
    private final BarbershopStaffRepository staffRepository;
    private final BarberProfileRepository profileRepository;
    private final BarberScheduleRepository scheduleRepository;
    private final BarberTimeOffRepository timeOffRepository;
    private final BarbershopServiceRepository shopServiceRepository;
    private final PricingRuleRepository pricingRuleRepository;
    private final ServiceOfferingRepository serviceOfferingRepository;
    private final UserRepository userRepository;
    private final CurrentUserService currentUserService;
    private final NotificationService notificationService;
    private final PaymentRepository paymentRepository;

    public BookingService(BookingRepository bookingRepository,
                          CustomerAddressRepository addressRepository,
                          BarbershopRepository barbershopRepository,
                          BarbershopStaffRepository staffRepository,
                          BarberProfileRepository profileRepository,
                          BarberScheduleRepository scheduleRepository,
                          BarberTimeOffRepository timeOffRepository,
                          BarbershopServiceRepository shopServiceRepository,
                          PricingRuleRepository pricingRuleRepository,
                          ServiceOfferingRepository serviceOfferingRepository,
                          UserRepository userRepository,
                          CurrentUserService currentUserService,
                          NotificationService notificationService,
                          PaymentRepository paymentRepository) {
        this.bookingRepository = bookingRepository;
        this.addressRepository = addressRepository;
        this.barbershopRepository = barbershopRepository;
        this.staffRepository = staffRepository;
        this.profileRepository = profileRepository;
        this.scheduleRepository = scheduleRepository;
        this.timeOffRepository = timeOffRepository;
        this.shopServiceRepository = shopServiceRepository;
        this.pricingRuleRepository = pricingRuleRepository;
        this.serviceOfferingRepository = serviceOfferingRepository;
        this.userRepository = userRepository;
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
        this.paymentRepository = paymentRepository;
    }

    @Transactional
    public BookingResponse create(BookingRequest request) {
        User customer = currentUserService.requireUser();

        if (request == null || request.items() == null || request.items().isEmpty()) {
            throw new IllegalArgumentException("Minimal satu peserta harus ditambahkan");
        }
        if (request.items().size() > 10) {
            throw new IllegalArgumentException("Satu booking maksimal untuk 10 peserta");
        }

        // 1. Resolve address and verify ownership
        CustomerAddress address = addressRepository.findById(request.addressId())
                .orElseThrow(() -> new IllegalArgumentException("Alamat tidak ditemukan"));
        if (!address.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("Alamat tidak valid untuk customer ini");
        }

        // 2. Resolve barber user via profile or direct User ID
        User barber = profileRepository.findByUser_Id(request.barberId())
                .map(BarberProfile::getUser)
                .orElseGet(() -> userRepository.findById(request.barberId()).orElse(null));
        if (barber == null) {
            throw new IllegalArgumentException("Barber tidak ditemukan");
        }
        if (barber.getRole() == null || !"Barber".equalsIgnoreCase(barber.getRole().getName())
                || !"active".equalsIgnoreCase(barber.getStatus())) {
            throw new IllegalArgumentException("Barber belum aktif atau belum terverifikasi");
        }
        BarberProfile barberProfile = profileRepository.findByUser_Id(barber.getId()).orElse(null);
        if (barberProfile == null || !"verified".equalsIgnoreCase(barberProfile.getVerificationStatus())) {
            throw new IllegalArgumentException("Profil barber belum diverifikasi admin");
        }

        // 3. Optional barbershop validation
        Barbershop barbershop = null;
        if (request.barbershopId() != null) {
            barbershop = barbershopRepository.findById(request.barbershopId())
                    .orElseThrow(() -> new IllegalArgumentException("Barbershop tidak ditemukan"));
            boolean isStaff = staffRepository
                    .findByBarbershop_IdAndBarber_IdAndEmploymentStatus(barbershop.getId(), barber.getId(), "active")
                    .isPresent();
            boolean isOwner = barbershop.getOwner() != null && barbershop.getOwner().getId().equals(barber.getId());
            if (!isStaff && !isOwner) {
                throw new IllegalArgumentException("Barber bukan karyawan aktif dari barbershop ini");
            }
        }

        // 4. Resolve every service and calculate the complete appointment duration server-side.
        List<ResolvedItem> resolvedItems = new ArrayList<>();
        int duration = 0;
        BigDecimal subtotal = BigDecimal.ZERO;
        int sequence = 1;
        for (BookingItemRequest item : request.items()) {
            if (item == null || item.participantName() == null || item.participantName().isBlank()) {
                throw new IllegalArgumentException("Nama setiap peserta wajib diisi");
            }
            String participantName = item.participantName().trim();
            if (participantName.length() > 100) {
                throw new IllegalArgumentException("Nama peserta maksimal 100 karakter");
            }
            BarbershopService service = resolveService(request.barbershopId(), item.serviceId());
            if (service == null || service.getService() == null) {
                throw new IllegalArgumentException("Layanan tidak ditemukan atau tidak aktif");
            }
            int itemDuration = service.getBusinessDuration() != null && service.getBusinessDuration() > 0
                    ? service.getBusinessDuration() : 30;
            BigDecimal itemPrice = service.getBusinessPrice() != null
                    ? service.getBusinessPrice() : service.getService().getPrice();
            if (itemPrice == null) itemPrice = BigDecimal.ZERO;
            resolvedItems.add(new ResolvedItem(participantName, sequence++, service, itemPrice, itemDuration));
            duration += itemDuration;
            subtotal = subtotal.add(itemPrice);
        }

        // 5. Parse start time and compute duration
        LocalDateTime start = parseStart(request.startDatetime());
        LocalDateTime end = start.plusMinutes(duration);

        // 6. Validate barber schedule
        validateBarberSchedule(barber.getId(), start, end);

        // 7. Compute distance using barber profile base location or barbershop location fallback
        BigDecimal baseLat = (barberProfile != null && barberProfile.getBaseLatitude() != null)
                ? barberProfile.getBaseLatitude()
                : (barbershop != null && barbershop.getLatitude() != null ? barbershop.getLatitude() : BigDecimal.valueOf(-6.2088));
        BigDecimal baseLng = (barberProfile != null && barberProfile.getBaseLongitude() != null)
                ? barberProfile.getBaseLongitude()
                : (barbershop != null && barbershop.getLongitude() != null ? barbershop.getLongitude() : BigDecimal.valueOf(106.8456));
        String baseSnapshot = (barberProfile != null && barberProfile.getBaseAddress() != null)
                ? barberProfile.getBaseAddress()
                : (barbershop != null ? barbershop.getBusinessAddress() : "Lokasi Barber");

        double distanceDouble = GeoDistance.haversine(
                address.getLatitude().doubleValue(), address.getLongitude().doubleValue(),
                baseLat.doubleValue(), baseLng.doubleValue()
        );
        BigDecimal distance = BigDecimal.valueOf(distanceDouble);

        // 8. Load active pricing rule with fallback defaults
        PricingRule pricingRule = pricingRuleRepository.findFirstByStatusOrderByIdAsc("active")
                .orElseGet(() -> {
                    PricingRule defaultRule = new PricingRule();
                    defaultRule.setFreeRadiusKm(BigDecimal.valueOf(5));
                    defaultRule.setPricePerKm(BigDecimal.valueOf(3000));
                    defaultRule.setMinimumTravelFee(BigDecimal.valueOf(5000));
                    defaultRule.setStatus("active");
                    return defaultRule;
                });

        // 9. Compute travel fee and totals. Travel is charged once per booking.
        BigDecimal travelFee = calculateTravelFee(distance, pricingRule);
        BigDecimal total = subtotal.add(travelFee);

        // 10. Build booking entity
        Booking booking = new Booking();
        booking.setBookingCode(generateBookingCode());
        booking.setCustomer(customer);
        booking.setBarber(barber);
        booking.setBarbershop(barbershop);
        booking.setCustomerAddress(address);
        booking.setPricingRule(pricingRule);
        booking.setStartDatetime(start);
        booking.setEndDatetime(end);
        booking.setAddressSnapshot(buildAddressSnapshot(address));
        booking.setCustomerLatitude(address.getLatitude());
        booking.setCustomerLongitude(address.getLongitude());
        booking.setBarberBaseSnapshot(baseSnapshot);
        booking.setBarberLatitude(baseLat);
        booking.setBarberLongitude(baseLng);
        booking.setDistanceKm(distance.setScale(2, RoundingMode.HALF_UP));
        booking.setFreeRadiusKm(pricingRule.getFreeRadiusKm());
        booking.setPricePerKm(pricingRule.getPricePerKm());
        booking.setTravelFee(travelFee);
        booking.setServiceSubtotal(subtotal);
        booking.setTotalPrice(total);
        booking.setStatus("pending");
        booking.setPaymentStatus("unpaid");
        booking.setNotes(blankToNull(request.notes()));
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        for (ResolvedItem item : resolvedItems) {
            BookingDetail detail = new BookingDetail();
            detail.setParticipantName(item.participantName());
            detail.setSequenceNumber(item.sequence());
            detail.setService(item.service().getService());
            detail.setServiceName(item.service().getService().getName());
            detail.setPrice(item.price());
            detail.setDuration(item.duration());
            detail.setSubtotal(item.price());
            booking.addDetail(detail);
        }
        Booking saved = bookingRepository.save(booking);

        // 11. Notify Barber of new booking request
        try {
            notificationService.createNotification(
                    barber.getId(),
                    "Pesanan Masuk Baru 🔔",
                    "Customer " + customer.getName() + " melakukan pemesanan #" + saved.getBookingCode() + ".",
                    "booking_created",
                    saved.getId()
            );
        } catch (Exception ignored) {
            // Notification failure shouldn't rollback booking transaction
        }

        return toResponse(saved);
    }

    private BarbershopService resolveService(Long barbershopId, Long serviceId) {
        if (serviceId == null) return null;
        if (barbershopId != null) {
            List<BarbershopService> activeShopServices = shopServiceRepository
                    .findByBarbershop_IdAndStatus(barbershopId, "active");
            if (!activeShopServices.isEmpty()) {
                // Detail page sends the barbershop_service id. Keep global service id as
                // a backwards-compatible fallback, but never allow a service that the
                // selected shop does not offer.
                return activeShopServices.stream()
                        .filter(item -> serviceId.equals(item.getId()))
                        .findFirst()
                        .or(() -> activeShopServices.stream()
                                .filter(item -> item.getService() != null && serviceId.equals(item.getService().getId()))
                                .findFirst())
                        .orElse(null);
            }
        }
        // Keep compatibility with old clients/data where serviceId was global.
        ServiceOffering offering = serviceOfferingRepository.findByIdAndStatus(serviceId, "active").orElse(null);
        if (offering == null) return null;
        BarbershopService wrapper = new BarbershopService();
        wrapper.setService(offering);
        wrapper.setStatus("active");
        return wrapper;
    }

    private record ResolvedItem(String participantName, int sequence, BarbershopService service,
                                BigDecimal price, int duration) {}

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings() {
        User user = currentUserService.requireUser();
        return bookingRepository.findByCustomer_IdOrderByStartDatetimeDesc(user.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public BookingResponse getBookingById(Long id) {
        User user = currentUserService.requireUser();
        Booking booking = bookingRepository.findById(id).orElse(null);
        if (booking == null) return null;
        boolean admin = user.getRole() != null && "Admin".equalsIgnoreCase(user.getRole().getName());
        if (!admin && !booking.getCustomer().getId().equals(user.getId())) {
            throw new IllegalStateException("Anda tidak memiliki akses ke booking ini");
        }
        return toResponse(booking);
    }

    @Transactional
    public void cancel(Long id, String reason) {
        User user = currentUserService.requireUser();

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking tidak ditemukan"));

        if (!booking.getCustomer().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Anda tidak memiliki akses untuk membatalkan booking ini");
        }

        if ("completed".equalsIgnoreCase(booking.getStatus()) || booking.getStatus().startsWith("cancelled")
                || "on_the_way".equalsIgnoreCase(booking.getStatus())
                || "arrived".equalsIgnoreCase(booking.getStatus())
                || "in_progress".equalsIgnoreCase(booking.getStatus())) {
            throw new IllegalStateException("Booking sudah selesai atau sudah dibatalkan");
        }

        booking.setStatus("cancelled_by_customer");
        booking.setCancellationReason(blankToNull(reason));
        booking.setUpdatedAt(LocalDateTime.now());
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
        bookingRepository.save(booking);

        try {
            notificationService.createNotification(
                    booking.getBarber().getId(),
                    "Pesanan Dibatalkan Customer ⚠️",
                    "Pesanan #" + booking.getBookingCode() + " dibatalkan oleh customer.",
                    "booking_cancelled",
                    booking.getId()
            );
        } catch (Exception ignored) {
            // Non-critical
        }
    }

    private void validateBarberSchedule(Long barberId, LocalDateTime start, LocalDateTime end) {
        boolean hasConflict = bookingRepository.existsOverlapping(barberId, start, end, BLOCKING_STATUSES);
        if (hasConflict) {
            throw new IllegalArgumentException("Jadwal barber sudah terisi untuk waktu yang dipilih");
        }

        boolean onTimeOff = timeOffRepository.existsOverlapping(barberId, start, end);
        if (onTimeOff) {
            throw new IllegalArgumentException("Barber sedang mengajukan waktu libur pada jadwal ini");
        }

        int dayOfWeek = start.getDayOfWeek().getValue();
        List<BarberSchedule> schedules = scheduleRepository.findByBarber_IdAndDayOfWeekAndStatus(barberId, (byte) dayOfWeek, "active");
        if (!schedules.isEmpty()) {
            BarberSchedule schedule = schedules.get(0);
            if (schedule.getStartTime() != null && schedule.getEndTime() != null) {
                boolean fitsSchedule = isWithinSchedule(start, end, schedule);
                if (!fitsSchedule) {
                    throw new IllegalArgumentException("Waktu booking berada di luar jam operasional barber (" +
                            schedule.getStartTime() + " - " + schedule.getEndTime() + ")");
                }
            }
        }
    }

    private boolean isWithinSchedule(LocalDateTime start, LocalDateTime end, BarberSchedule schedule) {
        return !start.toLocalTime().isBefore(schedule.getStartTime())
                && !end.toLocalTime().isAfter(schedule.getEndTime());
    }

    private LocalDateTime parseStart(String value) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException("Waktu booking wajib diisi");
        }
        try {
            LocalDateTime start;
            String trimmed = value.trim();
            if (trimmed.endsWith("Z") || trimmed.contains("+")) {
                start = java.time.ZonedDateTime.parse(trimmed).toLocalDateTime();
            } else if (trimmed.length() == 16) { // "yyyy-MM-ddTHH:mm"
                start = LocalDateTime.parse(trimmed + ":00");
            } else {
                start = LocalDateTime.parse(trimmed);
            }
            if (start.isBefore(LocalDateTime.now())) {
                start = LocalDateTime.now().plusMinutes(15);
            }
            return start;
        } catch (Exception exception) {
            throw new IllegalArgumentException("Format waktu booking tidak valid (" + value + ")");
        }
    }

    private BigDecimal calculateTravelFee(BigDecimal distance, PricingRule pricingRule) {
        BigDecimal excess = distance.subtract(pricingRule.getFreeRadiusKm()).max(BigDecimal.ZERO);
        BigDecimal fee = excess.multiply(pricingRule.getPricePerKm());
        if (pricingRule.getMinimumTravelFee() != null) {
            fee = fee.max(pricingRule.getMinimumTravelFee());
        }
        if (pricingRule.getMaximumTravelFee() != null) {
            fee = fee.min(pricingRule.getMaximumTravelFee());
        }
        return fee.setScale(2, RoundingMode.HALF_UP);
    }

    private BookingResponse toResponse(Booking booking) {
        String serviceName = booking.getDetails().isEmpty() ? "Layanan"
                : booking.getDetails().size() == 1 ? booking.getDetails().get(0).getServiceName()
                : booking.getDetails().get(0).getServiceName() + " + " + (booking.getDetails().size() - 1) + " lainnya";
        List<BookingDetailResponse> details = booking.getDetails().stream()
                .map(d -> new BookingDetailResponse(
                        d.getId(),
                        d.getParticipantName() == null ? "Peserta" : d.getParticipantName(),
                        d.getSequenceNumber() == null ? 1 : d.getSequenceNumber(),
                        d.getService() != null ? d.getService().getId() : null,
                        d.getServiceName(), d.getPrice(), d.getDuration(), d.getSubtotal()))
                .toList();
        return new BookingResponse(
                booking.getId(), booking.getBookingCode(),
                booking.getBarbershop() == null ? "Barbershop" : booking.getBarbershop().getName(),
                booking.getBarber().getName(), serviceName,
                booking.getStartDatetime().toString(), booking.getEndDatetime().toString(),
                booking.getAddressSnapshot(),
                booking.getCustomerLatitude(),
                booking.getCustomerLongitude(),
                booking.getBarberLatitude(),
                booking.getBarberLongitude(),
                booking.getBarber().getPhone(),
                booking.getDistanceKm(), booking.getServiceSubtotal(),
                booking.getTravelFee(), booking.getTotalPrice(), booking.getStatus(), booking.getPaymentStatus(),
                booking.getPaymentDeadline() != null ? booking.getPaymentDeadline().toString() : null,
                booking.getLocationUpdatedAt() != null ? booking.getLocationUpdatedAt().toString() : null,
                details
        );
    }

    private String buildAddressSnapshot(CustomerAddress address) {
        StringBuilder snapshot = new StringBuilder(address.getFullAddress());
        if (address.getDistrict() != null) snapshot.append(", ").append(address.getDistrict());
        if (address.getCity() != null) snapshot.append(", ").append(address.getCity());
        if (address.getProvince() != null) snapshot.append(", ").append(address.getProvince());
        if (address.getPostalCode() != null) snapshot.append(" ").append(address.getPostalCode());
        return snapshot.toString();
    }

    private String generateBookingCode() {
        return "DKR-" + UUID.randomUUID().toString().replace("-", "").substring(0, 12).toUpperCase();
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
