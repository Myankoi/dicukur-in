package com.dicukur.app.barbershop.service;

import com.dicukur.app.address.entity.CustomerAddress;
import com.dicukur.app.address.repository.CustomerAddressRepository;
import com.dicukur.app.barbershop.dto.BarbershopDetailResponse;
import com.dicukur.app.barbershop.dto.NearbyBarbershopResponse;
import com.dicukur.app.barbershop.dto.ShopServiceResponse;
import com.dicukur.app.barbershop.dto.StaffResponse;
import com.dicukur.app.barbershop.entity.BarberProfile;
import com.dicukur.app.barbershop.entity.Barbershop;
import com.dicukur.app.barbershop.entity.BarbershopPhoto;
import com.dicukur.app.barbershop.entity.BarbershopStaff;
import com.dicukur.app.barbershop.repository.BarberProfileRepository;
import com.dicukur.app.barbershop.repository.BarbershopPhotoRepository;
import com.dicukur.app.barbershop.repository.BarbershopRepository;
import com.dicukur.app.barbershop.repository.BarbershopStaffRepository;
import com.dicukur.app.common.location.GeoDistance;
import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.service.entity.BarbershopService;
import com.dicukur.app.service.entity.ServiceOffering;
import com.dicukur.app.service.repository.BarbershopServiceRepository;
import com.dicukur.app.service.repository.ServiceOfferingRepository;
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
    private final ServiceOfferingRepository offeringRepository;
    private final CustomerAddressRepository addressRepository;
    private final CurrentUserService currentUserService;
    private final BarbershopPhotoRepository photoRepository;

    public BarbershopDiscoveryService(BarbershopRepository barbershopRepository,
                                      BarbershopStaffRepository staffRepository,
                                      BarberProfileRepository profileRepository,
                                      BarbershopServiceRepository serviceRepository,
                                      ServiceOfferingRepository offeringRepository,
                                      CustomerAddressRepository addressRepository,
                                      CurrentUserService currentUserService,
                                      BarbershopPhotoRepository photoRepository) {
        this.barbershopRepository = barbershopRepository;
        this.staffRepository = staffRepository;
        this.profileRepository = profileRepository;
        this.serviceRepository = serviceRepository;
        this.offeringRepository = offeringRepository;
        this.addressRepository = addressRepository;
        this.currentUserService = currentUserService;
        this.photoRepository = photoRepository;
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
                .filter(this::hasEligibleBarber)
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

        // BUG 4 FIX: Fallback ke global ServiceOffering jika barbershop tidak memiliki kustomisasi layanan
        List<BarbershopService> shopServices = serviceRepository.findByBarbershop_IdAndStatus(id, ACTIVE);
        List<ShopServiceResponse> services;
        if (!shopServices.isEmpty()) {
            services = shopServices.stream().map(this::toService).toList();
        } else {
            // Tidak ada kustomisasi layanan untuk barbershop ini — gunakan layanan global aktif
            services = offeringRepository.findAllByStatus(ACTIVE).stream()
                    .map(this::toGlobalService)
                    .toList();
        }
        List<com.dicukur.app.barbershop.dto.BarbershopPhotoResponse> photos = photoRepository
                .findByBarbershopIdOrderBySortOrderAsc(id).stream()
                .map(p -> new com.dicukur.app.barbershop.dto.BarbershopPhotoResponse(
                        p.getId(), p.getBarbershop().getId(), p.getFilePath(), p.getCaption(), p.getSortOrder(), p.getUploadedAt()))
                .toList();

        return new BarbershopDetailResponse(
                shop.getId(), shop.getName(), shop.getDescription(), shop.getBusinessAddress(),
                shop.getDistrict(), shop.getCity(), shop.getProvince(), shop.getBusinessPhone(),
                shop.getBusinessEmail(), shop.getBusinessLicenseNumber(),
                shop.getLatitude().doubleValue(), shop.getLongitude().doubleValue(), shop.getServiceRadiusKm(),
                shop.getRatingAverage(), shop.getTotalCompleted(), staff, services, shop.getPhotoUrl(), photos
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
                shop.getTotalCompleted(), shop.getServiceRadiusKm(), shop.getPhotoUrl()
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
                profile.getTotalCompleted(), profile.getAvailabilityStatus(), barber.getPhoto()
        );
    }

    private boolean hasEligibleBarber(Barbershop shop) {
        return staffRepository.findByBarbershop_IdAndEmploymentStatus(shop.getId(), ACTIVE)
                .stream()
                .map(this::toStaff)
                .anyMatch(item -> item != null);
    }

    private ShopServiceResponse toService(BarbershopService shopService) {
        BigDecimal price = shopService.getBusinessPrice() != null
                ? shopService.getBusinessPrice() : shopService.getService().getPrice();
        Integer duration = shopService.getBusinessDuration() != null
                ? shopService.getBusinessDuration() : shopService.getService().getDuration();
        return new ShopServiceResponse(
                shopService.getId(), shopService.getService().getName(),
                shopService.getService().getDescription(), price, duration
        );
    }

    // BUG 4 FIX: Konversi global ServiceOffering ke ShopServiceResponse (tanpa kustomisasi)
    private ShopServiceResponse toGlobalService(ServiceOffering offering) {
        return new ShopServiceResponse(
                offering.getId(), offering.getName(),
                offering.getDescription(), offering.getPrice(), offering.getDuration()
        );
    }

    private double round(double value) {
        return Math.round(value * 100) / 100d;
    }
}
