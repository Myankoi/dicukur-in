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
import com.dicukur.app.booking.dto.BookingResponse;
import com.dicukur.app.booking.entity.Booking;
import com.dicukur.app.booking.entity.BookingDetail;
import com.dicukur.app.booking.repository.BookingRepository;
import com.dicukur.app.common.location.GeoDistance;
import com.dicukur.app.notification.service.NotificationService;
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
                          NotificationService notificationService) {
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
    }

    @Transactional
    public BookingResponse create(BookingRequest request) {
        User customer = currentUserService.requireUser();

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
                // If staff entry status isn't active, fallback to check if user has barber role
                boolean isBarberRole = barber.getRole() != null && ("BARBER".equalsIgnoreCase(barber.getRole().getName()) || "OWNER".equalsIgnoreCase(barber.getRole().getName()));
                if (!isBarberRole) {
                    throw new IllegalArgumentException("Barber bukan karyawan aktif dari barbershop ini");
                }
            }
        }

        // 4. Resolve service (BarbershopService ID → barbershop+global ID → global ServiceOffering fallback)
        BarbershopService service = shopServiceRepository.findById(request.serviceId())
                .orElseGet(() -> {
                    if (request.barbershopId() != null) {
                        BarbershopService found = shopServiceRepository.findByBarbershop_IdAndService_IdAndStatus(
                                request.barbershopId(), request.serviceId(), "active"
                        ).orElse(null);
                        if (found != null) return found;
                    }
                    // BUG 5 FIX: Fallback ke global ServiceOffering jika tidak ada di barbershop_services
                    ServiceOffering offering = serviceOfferingRepository
                            .findByIdAndStatus(request.serviceId(), "active").orElse(null);
                    if (offering != null) {
                        BarbershopService wrapper = new BarbershopService();
                        wrapper.setService(offering);
                        wrapper.setStatus("active");
                        return wrapper;
                    }
                    return null;
                });
        if (service == null) {
            throw new IllegalArgumentException("Layanan tidak ditemukan atau tidak aktif");
        }

        // 5. Parse start time and compute duration
        LocalDateTime start = parseStart(request.startDatetime());
        int duration = service.getBusinessDuration() != null && service.getBusinessDuration() > 0 ? service.getBusinessDuration() : 30;
        LocalDateTime end = start.plusMinutes(duration);

        // 6. Validate barber schedule
        validateBarberSchedule(barber.getId(), start, end);

        // 7. Compute distance using barber profile base location or barbershop location fallback
        BarberProfile barberProfile = profileRepository.findByUser_Id(barber.getId()).orElse(null);
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

        // 9. Compute travel fee and totals
        BigDecimal travelFee = calculateTravelFee(distance, pricingRule);
        BigDecimal subtotal = service.getBusinessPrice() != null
                ? service.getBusinessPrice()
                : (service.getService() != null ? service.getService().getPrice() : BigDecimal.ZERO);
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

        // Booking detail linking to service offering
        BookingDetail detail = new BookingDetail();
        detail.setService(service.getService());
        detail.setServiceName(service.getService() != null ? service.getService().getName() : "Layanan");
        detail.setPrice(subtotal);
        detail.setDuration(duration);
        detail.setSubtotal(subtotal);

        booking.addDetail(detail);
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
        return bookingRepository.findById(id)
                .map(this::toResponse)
                .orElse(null);
    }

    @Transactional
    public void cancel(Long id, String reason) {
        User user = currentUserService.requireUser();

        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Booking tidak ditemukan"));

        if (!booking.getCustomer().getId().equals(user.getId())) {
            throw new IllegalArgumentException("Anda tidak memiliki akses untuk membatalkan booking ini");
        }

        if ("completed".equalsIgnoreCase(booking.getStatus()) || booking.getStatus().startsWith("cancelled")) {
            throw new IllegalStateException("Booking sudah selesai atau sudah dibatalkan");
        }

        booking.setStatus("cancelled_by_customer");
        booking.setCancellationReason(blankToNull(reason));
        booking.setUpdatedAt(LocalDateTime.now());
        Booking saved = bookingRepository.save(booking);

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
        String serviceName = booking.getDetails().isEmpty() ? "Layanan" : booking.getDetails().get(0).getServiceName();
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
                booking.getTravelFee(), booking.getTotalPrice(), booking.getStatus(), booking.getPaymentStatus()
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
