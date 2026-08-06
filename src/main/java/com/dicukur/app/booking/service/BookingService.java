package com.dicukur.app.booking.service;

import com.dicukur.app.address.entity.CustomerAddress;
import com.dicukur.app.address.repository.CustomerAddressRepository;
import com.dicukur.app.barbershop.entity.BarberProfile;
import com.dicukur.app.barbershop.entity.BarberSchedule;
import com.dicukur.app.barbershop.entity.Barbershop;
import com.dicukur.app.barbershop.entity.BarbershopStaff;
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
import com.dicukur.app.service.repository.BarbershopServiceRepository;
import com.dicukur.app.service.repository.PricingRuleRepository;
import com.dicukur.app.user.entity.User;
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
        this.currentUserService = currentUserService;
        this.notificationService = notificationService;
    }

    @Transactional
    public BookingResponse create(BookingRequest request) {
        User customer = currentUserService.requireUser();

        // Resolve address and verify ownership
        CustomerAddress address = addressRepository.findById(request.addressId())
                .orElseThrow(() -> new IllegalArgumentException("Alamat tidak ditemukan"));
        if (!address.getCustomer().getId().equals(customer.getId())) {
            throw new IllegalArgumentException("Alamat tidak valid untuk customer ini");
        }

        // Resolve barber via profile
        User barber = profileRepository.findByUser_Id(request.barberId())
                .map(BarberProfile::getUser)
                .orElseThrow(() -> new IllegalArgumentException("Barber tidak ditemukan"));

        // Optional barbershop validation
        Barbershop barbershop = null;
        if (request.barbershopId() != null) {
            barbershop = barbershopRepository.findById(request.barbershopId())
                    .orElseThrow(() -> new IllegalArgumentException("Barbershop tidak ditemukan"));
            boolean isStaff = staffRepository
                    .findByBarbershop_IdAndBarber_IdAndEmploymentStatus(barbershop.getId(), barber.getId(), "active")
                    .isPresent();
            boolean isOwner = barbershop.getOwner().getId().equals(barber.getId());
            if (!isStaff && !isOwner) {
                throw new IllegalArgumentException("Barber bukan karyawan aktif dari barbershop ini");
            }
        }

        // Resolve service
        BarbershopService service = shopServiceRepository.findById(request.serviceId())
                .orElseThrow(() -> new IllegalArgumentException("Layanan tidak ditemukan"));
        if (!"active".equalsIgnoreCase(service.getStatus())) {
            throw new IllegalArgumentException("Layanan sedang tidak aktif");
        }
        if (barbershop != null && service.getBarbershop() != null && !service.getBarbershop().getId().equals(barbershop.getId())) {
            throw new IllegalArgumentException("Layanan tidak cocok dengan barbershop terpilih");
        }

        // Parse start time and compute duration
        LocalDateTime start = parseStart(request.startDatetime());
        int duration = service.getBusinessDuration() != null && service.getBusinessDuration() > 0 ? service.getBusinessDuration() : 30;
        LocalDateTime end = start.plusMinutes(duration);

        // Validate barber schedule
        validateBarberSchedule(barber.getId(), start, end);

        // Compute distance using barber profile base location
        BarberProfile barberProfile = profileRepository.findByUser_Id(barber.getId())
                .orElseThrow(() -> new IllegalArgumentException("Profil barber tidak ditemukan"));
        double distanceDouble = GeoDistance.haversine(
                address.getLatitude().doubleValue(), address.getLongitude().doubleValue(),
                barberProfile.getBaseLatitude().doubleValue(), barberProfile.getBaseLongitude().doubleValue()
        );
        BigDecimal distance = BigDecimal.valueOf(distanceDouble);

        // Load active pricing rule
        PricingRule pricingRule = pricingRuleRepository.findFirstByStatusOrderByIdAsc("active")
                .orElseThrow(() -> new IllegalStateException("Aturan harga belum dikonfigurasi admin"));

        // Compute travel fee and totals
        BigDecimal travelFee = calculateTravelFee(distance, pricingRule);
        BigDecimal subtotal = service.getBusinessPrice();
        BigDecimal total = subtotal.add(travelFee);

        // Build booking entity
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
        booking.setBarberBaseSnapshot(barberProfile.getBaseAddress());
        booking.setBarberLatitude(barberProfile.getBaseLatitude());
        booking.setBarberLongitude(barberProfile.getBaseLongitude());
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

        // Notify Barber of new booking request
        notificationService.createNotification(
                barber.getId(),
                "Pesanan Masuk Baru 🔔",
                "Customer " + customer.getName() + " melakukan pemesanan #" + saved.getBookingCode() + ".",
                "booking_created",
                saved.getId()
        );

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

        // Notify Barber about cancellation
        notificationService.createNotification(
                booking.getBarber().getId(),
                "Pesanan Dibatalkan Customer ⚠️",
                "Pesanan #" + booking.getBookingCode() + " dibatalkan oleh customer.",
                "booking_cancelled",
                booking.getId()
        );
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
        // Retrieve active schedule for the day
        List<BarberSchedule> schedules = scheduleRepository.findByBarber_IdAndDayOfWeekAndStatus(barberId, (byte) dayOfWeek, "active");
        if (schedules.isEmpty()) {
            throw new IllegalArgumentException("Barber tidak memiliki jadwal kerja pada hari tersebut");
        }
        BarberSchedule schedule = schedules.get(0);

        if (schedule.getStartTime() == null || schedule.getEndTime() == null) {
            throw new IllegalArgumentException("Jam kerja barber belum diatur");
        }

        boolean fitsSchedule = isWithinSchedule(start, end, schedule);
        if (!fitsSchedule) {
            throw new IllegalArgumentException("Waktu booking berada di luar jam operasional barber (" +
                    schedule.getStartTime() + " - " + schedule.getEndTime() + ")");
        }
    }

    private boolean isWithinSchedule(LocalDateTime start, LocalDateTime end, BarberSchedule schedule) {
        return !start.toLocalTime().isBefore(schedule.getStartTime())
                && !end.toLocalTime().isAfter(schedule.getEndTime());
    }

    private LocalDateTime parseStart(String value) {
        try {
            LocalDateTime start = LocalDateTime.parse(value);
            if (start.isBefore(LocalDateTime.now().plusMinutes(15))) {
                throw new IllegalArgumentException("Booking minimal 15 menit dari sekarang");
            }
            return start;
        } catch (DateTimeParseException exception) {
            throw new IllegalArgumentException("Format waktu booking tidak valid");
        }
    }

    private BigDecimal calculateTravelFee(BigDecimal distance, PricingRule pricingRule) {
        BigDecimal excess = distance.subtract(pricingRule.getFreeRadiusKm()).max(BigDecimal.ZERO);
        BigDecimal fee = excess.multiply(pricingRule.getPricePerKm());
        fee = fee.max(pricingRule.getMinimumTravelFee());
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

    private BigDecimal money(double value, int scale) {
        return BigDecimal.valueOf(value).setScale(scale, RoundingMode.HALF_UP);
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
