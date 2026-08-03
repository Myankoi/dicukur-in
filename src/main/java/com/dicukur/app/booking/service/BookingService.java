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

    public BookingService(BookingRepository bookingRepository,
                          CustomerAddressRepository addressRepository,
                          BarbershopRepository barbershopRepository,
                          BarbershopStaffRepository staffRepository,
                          BarberProfileRepository profileRepository,
                          BarberScheduleRepository scheduleRepository,
                          BarberTimeOffRepository timeOffRepository,
                          BarbershopServiceRepository shopServiceRepository,
                          PricingRuleRepository pricingRuleRepository,
                          CurrentUserService currentUserService) {
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
    }

    @Transactional
    public BookingResponse create(BookingRequest request) {
        User customer = currentUserService.requireRole("Customer");
        CustomerAddress address = addressRepository.findByIdAndCustomer_Id(request.addressId(), customer.getId())
                .orElseThrow(() -> new IllegalArgumentException("Alamat tidak ditemukan"));
        Barbershop shop = barbershopRepository.findByIdAndStatusAndVerificationStatus(
                        request.barbershopId(), "active", "approved")
                .orElseThrow(() -> new IllegalArgumentException("Barbershop tidak ditemukan atau belum aktif"));
        BarbershopStaff staff = staffRepository.findByBarbershop_IdAndBarber_IdAndEmploymentStatus(
                        shop.getId(), request.barberId(), "active")
                .orElseThrow(() -> new IllegalArgumentException("Barber bukan karyawan aktif barbershop ini"));
        BarberProfile profile = profileRepository.findByUser_Id(staff.getBarber().getId())
                .filter(item -> "verified".equalsIgnoreCase(item.getVerificationStatus()))
                .filter(item -> "employee".equalsIgnoreCase(item.getBarberType())
                        || "owner".equalsIgnoreCase(item.getBarberType()))
                .orElseThrow(() -> new IllegalArgumentException("Profile barber belum terverifikasi sebagai karyawan"));
        if (!"active".equalsIgnoreCase(staff.getBarber().getStatus())) {
            throw new IllegalArgumentException("Barber sedang tidak aktif");
        }

        BarbershopService shopService = shopServiceRepository
                .findByBarbershop_IdAndService_IdAndStatus(shop.getId(), request.serviceId(), "active")
                .orElseThrow(() -> new IllegalArgumentException("Layanan tidak tersedia di barbershop ini"));
        BigDecimal price = shopService.getBusinessPrice() != null
                ? shopService.getBusinessPrice() : shopService.getService().getPrice();
        int duration = shopService.getBusinessDuration() != null
                ? shopService.getBusinessDuration() : shopService.getService().getDuration();

        LocalDateTime start = parseStart(request.startDatetime());
        LocalDateTime end = start.plusMinutes(duration);
        validateSchedule(staff.getBarber().getId(), start, end);
        if (bookingRepository.existsOverlapping(staff.getBarber().getId(), start, end, BLOCKING_STATUSES)) {
            throw new IllegalArgumentException("Jadwal barber sudah terisi di waktu tersebut");
        }

        double distance = GeoDistance.haversine(
                address.getLatitude().doubleValue(), address.getLongitude().doubleValue(),
                profile.getBaseLatitude().doubleValue(), profile.getBaseLongitude().doubleValue()
        );
        if (distance > shop.getServiceRadiusKm().doubleValue()) {
            throw new IllegalArgumentException("Alamat berada di luar radius layanan barbershop");
        }

        PricingRule pricingRule = pricingRuleRepository.findFirstByStatusOrderByIdAsc("active")
                .orElseThrow(() -> new IllegalStateException("Aturan harga belum tersedia"));
        BigDecimal distanceValue = money(distance, 2);
        BigDecimal travelFee = calculateTravelFee(distanceValue, pricingRule);
        BigDecimal subtotal = price.setScale(2, RoundingMode.HALF_UP);

        Booking booking = new Booking();
        booking.setBookingCode(generateBookingCode());
        booking.setCustomer(customer);
        booking.setBarber(staff.getBarber());
        booking.setBarbershop(shop);
        booking.setCustomerAddress(address);
        booking.setPricingRule(pricingRule);
        booking.setStartDatetime(start);
        booking.setEndDatetime(end);
        booking.setAddressSnapshot(buildAddressSnapshot(address));
        booking.setCustomerLatitude(address.getLatitude());
        booking.setCustomerLongitude(address.getLongitude());
        booking.setBarberBaseSnapshot(profile.getBaseAddress());
        booking.setBarberLatitude(profile.getBaseLatitude());
        booking.setBarberLongitude(profile.getBaseLongitude());
        booking.setDistanceKm(distanceValue);
        booking.setFreeRadiusKm(pricingRule.getFreeRadiusKm());
        booking.setPricePerKm(pricingRule.getPricePerKm());
        booking.setTravelFee(travelFee);
        booking.setServiceSubtotal(subtotal);
        booking.setTotalPrice(subtotal.add(travelFee));
        booking.setStatus("pending");
        booking.setPaymentStatus("unpaid");
        booking.setNotes(blankToNull(request.notes()));
        booking.setCreatedAt(LocalDateTime.now());
        booking.setUpdatedAt(LocalDateTime.now());

        BookingDetail detail = new BookingDetail();
        detail.setService(shopService.getService());
        detail.setServiceName(shopService.getService().getName());
        detail.setPrice(subtotal);
        detail.setDuration(duration);
        detail.setSubtotal(subtotal);
        booking.addDetail(detail);

        return toResponse(bookingRepository.save(booking));
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> getMyBookings() {
        User customer = currentUserService.requireRole("Customer");
        return bookingRepository.findByCustomer_IdOrderByStartDatetimeDesc(customer.getId())
                .stream().map(this::toResponse).toList();
    }

    @Transactional
    public void cancel(Long id, String reason) {
        User customer = currentUserService.requireRole("Customer");
        Booking booking = bookingRepository.findByCustomer_IdAndId(customer.getId(), id)
                .stream().findFirst()
                .orElseThrow(() -> new IllegalArgumentException("Booking tidak ditemukan"));
        if (!("pending".equals(booking.getStatus()) || "accepted".equals(booking.getStatus()))) {
            throw new IllegalArgumentException("Booking ini tidak bisa dibatalkan");
        }
        booking.setStatus("cancelled_by_customer");
        booking.setCancellationReason(blankToNull(reason));
        booking.setUpdatedAt(LocalDateTime.now());
        bookingRepository.save(booking);
    }

    private void validateSchedule(Long barberId, LocalDateTime start, LocalDateTime end) {
        byte day = (byte) start.getDayOfWeek().getValue();
        boolean withinSchedule = scheduleRepository.findByBarber_IdAndDayOfWeekAndStatus(barberId, day, "active")
                .stream()
                .anyMatch(schedule -> isWithin(schedule, start, end));
        if (!withinSchedule) {
            throw new IllegalArgumentException("Barber tidak tersedia pada jam tersebut");
        }
        if (timeOffRepository.existsOverlapping(barberId, start, end)) {
            throw new IllegalArgumentException("Barber sedang libur pada jam tersebut");
        }
    }

    private boolean isWithin(BarberSchedule schedule, LocalDateTime start, LocalDateTime end) {
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
                booking.getAddressSnapshot(), booking.getDistanceKm(), booking.getServiceSubtotal(),
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
