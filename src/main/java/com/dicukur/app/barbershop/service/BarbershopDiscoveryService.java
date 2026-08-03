package com.dicukur.app.barbershop.service;

import com.dicukur.app.address.entity.CustomerAddress;
import com.dicukur.app.address.repository.CustomerAddressRepository;
import com.dicukur.app.barbershop.dto.BarbershopDetailResponse;
import com.dicukur.app.barbershop.dto.NearbyBarbershopResponse;
import com.dicukur.app.barbershop.dto.ShopServiceResponse;
import com.dicukur.app.barbershop.dto.StaffResponse;
import com.dicukur.app.barbershop.entity.BarberProfile;
import com.dicukur.app.barbershop.entity.Barbershop;
import com.dicukur.app.barbershop.entity.BarbershopStaff;
import com.dicukur.app.barbershop.repository.BarberProfileRepository;
import com.dicukur.app.barbershop.repository.BarbershopRepository;
import com.dicukur.app.barbershop.repository.BarbershopStaffRepository;
import com.dicukur.app.common.location.GeoDistance;
import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.service.entity.BarbershopService;
import com.dicukur.app.service.repository.BarbershopServiceRepository;
import com.dicukur.app.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Comparator;
import java.util.List;

@Service
public class BarbershopDiscoveryService {

    private static final String ACTIVE = "active";
    private static final String APPROVED = "approved";
    private static final String VERIFIED = "verified";

    private final BarbershopRepository barbershopRepository;
    private final BarbershopStaffRepository staffRepository;
    private final BarberProfileRepository profileRepository;
    private final BarbershopServiceRepository serviceRepository;
    private final CustomerAddressRepository addressRepository;
    private final CurrentUserService currentUserService;

    public BarbershopDiscoveryService(BarbershopRepository barbershopRepository,
                                      BarbershopStaffRepository staffRepository,
                                      BarberProfileRepository profileRepository,
                                      BarbershopServiceRepository serviceRepository,
                                      CustomerAddressRepository addressRepository,
                                      CurrentUserService currentUserService) {
        this.barbershopRepository = barbershopRepository;
        this.staffRepository = staffRepository;
        this.profileRepository = profileRepository;
        this.serviceRepository = serviceRepository;
        this.addressRepository = addressRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<NearbyBarbershopResponse> searchNearby(Long addressId, double radiusKm) {
        User customer = currentUserService.requireRole("Customer");
        CustomerAddress address = addressRepository.findByIdAndCustomer_Id(addressId, customer.getId())
                .orElseThrow(() -> new IllegalArgumentException("Alamat tidak ditemukan"));
        double requestedRadius = radiusKm > 0 ? Math.min(radiusKm, 100) : 25;
        double latitude = address.getLatitude().doubleValue();
        double longitude = address.getLongitude().doubleValue();
        double latitudeDelta = requestedRadius / 111.32;
        double longitudeDelta = requestedRadius / Math.max(111.32 * Math.cos(Math.toRadians(latitude)), 0.01);

        return barbershopRepository.findNearbyCandidates(
                        ACTIVE, APPROVED,
                        BigDecimal.valueOf(latitude - latitudeDelta),
                        BigDecimal.valueOf(latitude + latitudeDelta),
                        BigDecimal.valueOf(longitude - longitudeDelta),
                        BigDecimal.valueOf(longitude + longitudeDelta)
                ).stream()
                .map(shop -> toNearby(shop, latitude, longitude, requestedRadius))
                .filter(response -> response != null)
                .sorted(Comparator.comparingDouble(NearbyBarbershopResponse::distanceKm))
                .toList();
    }

    @Transactional(readOnly = true)
    public BarbershopDetailResponse getDetail(Long id) {
        currentUserService.requireRole("Customer");
        Barbershop shop = barbershopRepository.findByIdAndStatusAndVerificationStatus(id, ACTIVE, APPROVED)
                .orElseThrow(() -> new IllegalArgumentException("Barbershop tidak ditemukan atau belum aktif"));

        List<StaffResponse> staff = staffRepository.findByBarbershop_IdAndEmploymentStatus(id, ACTIVE).stream()
                .map(this::toStaff)
                .filter(item -> item != null)
                .toList();
        List<ShopServiceResponse> services = serviceRepository.findByBarbershop_IdAndStatus(id, ACTIVE).stream()
                .map(this::toService)
                .toList();

        return new BarbershopDetailResponse(
                shop.getId(), shop.getName(), shop.getDescription(), shop.getBusinessAddress(),
                shop.getDistrict(), shop.getCity(), shop.getProvince(), shop.getBusinessPhone(),
                shop.getLatitude().doubleValue(), shop.getLongitude().doubleValue(), shop.getServiceRadiusKm(),
                shop.getRatingAverage(), shop.getTotalCompleted(), staff, services
        );
    }

    private NearbyBarbershopResponse toNearby(Barbershop shop, double latitude, double longitude, double radiusKm) {
        double distance = GeoDistance.haversine(latitude, longitude,
                shop.getLatitude().doubleValue(), shop.getLongitude().doubleValue());
        if (distance > radiusKm || distance > shop.getServiceRadiusKm().doubleValue()) {
            return null;
        }
        return new NearbyBarbershopResponse(
                shop.getId(), shop.getName(), shop.getDescription(), shop.getBusinessAddress(),
                shop.getDistrict(), shop.getCity(), shop.getProvince(), shop.getLatitude().doubleValue(),
                shop.getLongitude().doubleValue(), round(distance), shop.getRatingAverage(),
                shop.getTotalCompleted(), shop.getServiceRadiusKm()
        );
    }

    private StaffResponse toStaff(BarbershopStaff staff) {
        User barber = staff.getBarber();
        if (!ACTIVE.equalsIgnoreCase(barber.getStatus())) {
            return null;
        }
        BarberProfile profile = profileRepository.findByUser_Id(barber.getId()).orElse(null);
        if (profile == null || !VERIFIED.equalsIgnoreCase(profile.getVerificationStatus())
                || !("employee".equalsIgnoreCase(profile.getBarberType())
                || "owner".equalsIgnoreCase(profile.getBarberType()))) {
            return null;
        }
        return new StaffResponse(
                barber.getId(), barber.getName(), staff.getPosition(), profile.getRatingAverage(),
                profile.getTotalCompleted(), profile.getAvailabilityStatus()
        );
    }

    private ShopServiceResponse toService(BarbershopService shopService) {
        BigDecimal price = shopService.getBusinessPrice() != null
                ? shopService.getBusinessPrice() : shopService.getService().getPrice();
        Integer duration = shopService.getBusinessDuration() != null
                ? shopService.getBusinessDuration() : shopService.getService().getDuration();
        return new ShopServiceResponse(
                shopService.getService().getId(), shopService.getService().getName(),
                shopService.getService().getDescription(), price, duration
        );
    }

    private double round(double value) {
        return Math.round(value * 100) / 100d;
    }
}
