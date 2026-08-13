package com.dicukur.app.barbershop.service;

import com.dicukur.app.barbershop.dto.*;
import com.dicukur.app.barbershop.entity.BarberProfile;
import com.dicukur.app.barbershop.entity.Barbershop;
import com.dicukur.app.barbershop.entity.BarbershopPhoto;
import com.dicukur.app.barbershop.entity.BarbershopStaff;
import com.dicukur.app.barbershop.repository.BarberProfileRepository;
import com.dicukur.app.barbershop.repository.BarbershopPhotoRepository;
import com.dicukur.app.barbershop.repository.BarbershopRepository;
import com.dicukur.app.barbershop.repository.BarbershopStaffRepository;
import com.dicukur.app.booking.repository.BookingRepository;
import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.user.entity.Role;
import com.dicukur.app.user.entity.User;
import com.dicukur.app.user.repository.RoleRepository;
import com.dicukur.app.user.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

@Service
public class OwnerService {

    private final BarbershopRepository barbershopRepository;
    private final BarbershopStaffRepository staffRepository;
    private final BarberProfileRepository barberProfileRepository;
    private final BookingRepository bookingRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final BarbershopPhotoRepository photoRepository;
    private final CurrentUserService currentUserService;

    public OwnerService(BarbershopRepository barbershopRepository,
                        BarbershopStaffRepository staffRepository,
                        BarberProfileRepository barberProfileRepository,
                        BookingRepository bookingRepository,
                        UserRepository userRepository,
                        RoleRepository roleRepository,
                        PasswordEncoder passwordEncoder,
                        CurrentUserService currentUserService,
                        BarbershopPhotoRepository photoRepository) {
        this.barbershopRepository = barbershopRepository;
        this.staffRepository = staffRepository;
        this.barberProfileRepository = barberProfileRepository;
        this.bookingRepository = bookingRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.currentUserService = currentUserService;
        this.photoRepository = photoRepository;
    }

    @Transactional(readOnly = true)
    public OwnerDashboardSummaryResponse getDashboardSummary() {
        User owner = currentUserService.requireRole("Owner");
        Barbershop shop = barbershopRepository.findByOwner_Id(owner.getId()).orElse(null);

        if (shop == null) {
            return new OwnerDashboardSummaryResponse(
                    null,
                    "Belum Mendaftarkan Barbershop",
                    "pending",
                    "inactive",
                    0,
                    0,
                    0,
                    BigDecimal.ZERO,
                    BigDecimal.ZERO
            );
        }

        long totalBookings = bookingRepository.countByBarbershop_Id(shop.getId());
        long completedBookings = bookingRepository.countByBarbershop_IdAndStatus(shop.getId(), "completed");
        long activeStaff = staffRepository.findByBarbershop_IdAndEmploymentStatus(shop.getId(), "active").size();

        return new OwnerDashboardSummaryResponse(
                shop.getId(),
                shop.getName(),
                shop.getVerificationStatus(),
                shop.getStatus(),
                totalBookings,
                completedBookings,
                activeStaff,
                BigDecimal.valueOf(completedBookings * 50000L),
                shop.getRatingAverage() != null ? shop.getRatingAverage() : BigDecimal.ZERO
        );
    }

    @Transactional(readOnly = true)
    public BarbershopDetailResponse getMyBarbershop() {
        User owner = currentUserService.requireRole("Owner");
        Barbershop shop = barbershopRepository.findByOwner_Id(owner.getId())
                .orElseThrow(() -> new IllegalArgumentException("Profil Barbershop belum terdaftar"));

        return toBarbershopDetailResponse(shop);
    }

    @Transactional
    public BarbershopDetailResponse updateMyBarbershop(BarbershopUpdateRequest req) {
        User owner = currentUserService.requireRole("Owner");
        Barbershop shop = barbershopRepository.findByOwner_Id(owner.getId())
                .orElseGet(() -> {
                    Barbershop newShop = new Barbershop();
                    newShop.setOwner(owner);
                    newShop.setVerificationStatus("pending");
                    newShop.setStatus("inactive");
                    newShop.setRatingAverage(BigDecimal.ZERO);
                    newShop.setTotalCompleted(0);
                    newShop.setCreatedAt(LocalDateTime.now());
                    return newShop;
                });

        if (shop.getRatingAverage() == null) {
            shop.setRatingAverage(BigDecimal.ZERO);
        }
        if (shop.getTotalCompleted() == null) {
            shop.setTotalCompleted(0);
        }
        if (shop.getVerificationStatus() == null) {
            shop.setVerificationStatus("pending");
        }
        if (shop.getStatus() == null) {
            shop.setStatus("inactive");
        }

        String name = req.name() != null ? req.name().trim() : "";
        String address = req.businessAddress() != null ? req.businessAddress().trim() : "";
        String city = req.city() != null ? req.city().trim() : "";

        if (name.isBlank()) {
            throw new IllegalArgumentException("Nama barbershop wajib diisi");
        }
        if (address.isBlank()) {
            throw new IllegalArgumentException("Alamat bisnis wajib diisi");
        }
        if (city.isBlank()) {
            throw new IllegalArgumentException("Kota wajib diisi");
        }

        shop.setName(name);
        shop.setDescription(blankToNull(req.description()));
        shop.setBusinessPhone(blankToNull(req.businessPhone()));
        shop.setBusinessEmail(blankToNull(req.businessEmail()));
        shop.setBusinessLicenseNumber(blankToNull(req.businessLicenseNumber()));
        shop.setBusinessAddress(address);
        shop.setDistrict(blankToNull(req.district()));
        shop.setCity(city);
        shop.setProvince(blankToNull(req.province()));
        shop.setPostalCode(blankToNull(req.postalCode()));
        shop.setLatitude(req.latitude() != null ? req.latitude() : new BigDecimal("-6.2088"));
        shop.setLongitude(req.longitude() != null ? req.longitude() : new BigDecimal("106.8456"));
        shop.setServiceRadiusKm(req.serviceRadiusKm() != null ? req.serviceRadiusKm() : new BigDecimal("10.0"));
        shop.setUpdatedAt(LocalDateTime.now());

        Barbershop saved = barbershopRepository.save(shop);
        return toBarbershopDetailResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<StaffResponse> getMyStaff() {
        User owner = currentUserService.requireRole("Owner");
        Barbershop shop = barbershopRepository.findByOwner_Id(owner.getId()).orElse(null);
        if (shop == null) return List.of();

        return staffRepository.findByBarbershop_IdOrderByJoinedAtDesc(shop.getId()).stream()
                .map(this::toStaffResponse)
                .toList();
    }

    @Transactional
    public StaffResponse addStaff(AddStaffRequest req) {
        User owner = currentUserService.requireRole("Owner");
        Barbershop shop = barbershopRepository.findByOwner_Id(owner.getId())
                .orElseThrow(() -> new IllegalArgumentException("Barbershop Anda belum disetujui atau belum terdaftar"));

        if (!"approved".equalsIgnoreCase(shop.getVerificationStatus())) {
            throw new IllegalStateException("Barbershop Anda harus disetujui Admin terlebih dahulu sebelum menambah staf");
        }

        String email = req.email().trim().toLowerCase(Locale.ROOT);
        if (userRepository.existsByEmail(email)) {
            throw new IllegalArgumentException("Email sudah terdaftar: " + email);
        }

        Role barberRole = roleRepository.findByName("Barber")
                .orElseThrow(() -> new IllegalStateException("Role Barber tidak ditemukan"));

        LocalDateTime now = LocalDateTime.now();

        // 1. Buat User Barber baru
        User barber = new User();
        barber.setName(req.name().trim());
        barber.setEmail(email);
        barber.setPhone(blankToNull(req.phone()));
        barber.setPassword(passwordEncoder.encode(req.password()));
        barber.setRole(barberRole);
        barber.setStatus("active");
        barber.setCreatedAt(now);
        barber.setUpdatedAt(now);
        User savedBarber = userRepository.save(barber);

        // 2. Buat Barber Profile
        BarberProfile profile = new BarberProfile();
        profile.setUser(savedBarber);
        profile.setBarberType("employee");
        profile.setBarbershop(shop);
        profile.setBaseAddress(shop.getBusinessAddress());
        profile.setBaseLatitude(shop.getLatitude());
        profile.setBaseLongitude(shop.getLongitude());
        profile.setServiceRadiusKm(shop.getServiceRadiusKm());
        profile.setVerificationStatus("verified");
        profile.setAvailabilityStatus("available");
        profile.setCreatedAt(now);
        profile.setUpdatedAt(now);
        barberProfileRepository.save(profile);

        // 3. Kaitkan ke Barbershop Staff
        BarbershopStaff staff = new BarbershopStaff();
        staff.setBarbershop(shop);
        staff.setBarber(savedBarber);
        staff.setAddedBy(owner);
        staff.setPosition(req.position() != null && !req.position().isBlank() ? req.position().trim() : "Barber");
        staff.setEmploymentStatus("active");
        staff.setJoinedAt(now);
        staff.setCreatedAt(now);
        staff.setUpdatedAt(now);
        BarbershopStaff savedStaff = staffRepository.save(staff);

        return toStaffResponse(savedStaff);
    }

    @Transactional
    public StaffResponse toggleStaffStatus(Long staffId) {
        User owner = currentUserService.requireRole("Owner");
        BarbershopStaff staff = staffRepository.findById(staffId)
                .orElseThrow(() -> new IllegalArgumentException("Data staf tidak ditemukan"));

        if (!staff.getBarbershop().getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Anda tidak memiliki akses ke staf ini");
        }

        String newStatus = "active".equalsIgnoreCase(staff.getEmploymentStatus()) ? "inactive" : "active";
        staff.setEmploymentStatus(newStatus);
        staff.setUpdatedAt(LocalDateTime.now());

        User barber = staff.getBarber();
        barber.setStatus(newStatus);
        userRepository.save(barber);

        return toStaffResponse(staffRepository.save(staff));
    }

    @Transactional(readOnly = true)
    public List<BarbershopPhotoResponse> getMyPhotos() {
        User owner = currentUserService.requireRole("Owner");
        Barbershop shop = barbershopRepository.findByOwner_Id(owner.getId()).orElse(null);
        if (shop == null) return List.of();
        return photoRepository.findByBarbershopIdOrderBySortOrderAsc(shop.getId()).stream()
                .map(p -> new BarbershopPhotoResponse(p.getId(), p.getBarbershop().getId(), p.getFilePath(), p.getCaption(), p.getSortOrder(), p.getUploadedAt()))
                .toList();
    }

    @Transactional
    public BarbershopPhotoResponse addPhoto(String filePath, String caption) {
        User owner = currentUserService.requireRole("Owner");
        if (filePath == null || filePath.isBlank()) {
            throw new IllegalArgumentException("File path foto tidak boleh kosong");
        }

        Barbershop shop = barbershopRepository.findByOwner_Id(owner.getId())
                .orElseGet(() -> {
                    Barbershop newShop = new Barbershop();
                    newShop.setOwner(owner);
                    newShop.setName(owner.getName() != null ? owner.getName() + " Barbershop" : "Barbershop Utama");
                    newShop.setBusinessAddress("Alamat belum diisi");
                    newShop.setCity("Jakarta");
                    newShop.setLatitude(new BigDecimal("-6.2088"));
                    newShop.setLongitude(new BigDecimal("106.8456"));
                    newShop.setServiceRadiusKm(new BigDecimal("10.0"));
                    newShop.setVerificationStatus("pending");
                    newShop.setStatus("inactive");
                    newShop.setRatingAverage(BigDecimal.ZERO);
                    newShop.setTotalCompleted(0);
                    newShop.setCreatedAt(LocalDateTime.now());
                    return barbershopRepository.save(newShop);
                });

        BarbershopPhoto photo = new BarbershopPhoto();
        photo.setBarbershop(shop);
        photo.setFilePath(filePath.trim());
        photo.setCaption(blankToNull(caption));
        photo.setSortOrder((int) photoRepository.countByBarbershopId(shop.getId()) + 1);
        photo.setUploadedAt(LocalDateTime.now());
        BarbershopPhoto saved = photoRepository.save(photo);

        if (shop.getPhotoUrl() == null) {
            shop.setPhotoUrl(filePath.trim());
            barbershopRepository.save(shop);
        }

        return new BarbershopPhotoResponse(
                saved.getId(),
                shop.getId(),
                saved.getFilePath(),
                saved.getCaption(),
                saved.getSortOrder(),
                saved.getUploadedAt() != null ? saved.getUploadedAt() : LocalDateTime.now()
        );
    }

    @Transactional
    public void deletePhoto(Long photoId) {
        User owner = currentUserService.requireRole("Owner");
        BarbershopPhoto photo = photoRepository.findById(photoId)
                .orElseThrow(() -> new IllegalArgumentException("Foto tidak ditemukan"));
        if (!photo.getBarbershop().getOwner().getId().equals(owner.getId())) {
            throw new IllegalArgumentException("Anda tidak memiliki akses ke foto ini");
        }
        photoRepository.delete(photo);
    }

    @Transactional
    public BarbershopDetailResponse updateMainPhoto(String photoUrl) {
        User owner = currentUserService.requireRole("Owner");
        Barbershop shop = barbershopRepository.findByOwner_Id(owner.getId())
                .orElseThrow(() -> new IllegalArgumentException("Barbershop Anda belum terdaftar"));
        shop.setPhotoUrl(photoUrl);
        shop.setUpdatedAt(LocalDateTime.now());
        return toBarbershopDetailResponse(barbershopRepository.save(shop));
    }

    private BarbershopDetailResponse toBarbershopDetailResponse(Barbershop shop) {
        List<BarbershopPhotoResponse> photos = photoRepository != null && shop.getId() != null
                ? photoRepository.findByBarbershopIdOrderBySortOrderAsc(shop.getId()).stream()
                    .map(p -> new BarbershopPhotoResponse(p.getId(), shop.getId(), p.getFilePath(), p.getCaption(), p.getSortOrder(), p.getUploadedAt()))
                    .toList()
                : List.of();
        return new BarbershopDetailResponse(
                shop.getId(),
                shop.getName(),
                shop.getDescription(),
                shop.getBusinessAddress(),
                shop.getDistrict(),
                shop.getCity(),
                shop.getProvince(),
                shop.getBusinessPhone(),
                shop.getLatitude() != null ? shop.getLatitude().doubleValue() : -6.2088,
                shop.getLongitude() != null ? shop.getLongitude().doubleValue() : 106.8456,
                shop.getServiceRadiusKm(),
                shop.getRatingAverage(),
                shop.getTotalCompleted(),
                getMyStaff(),
                List.of(),
                shop.getPhotoUrl(),
                photos
        );
    }

    private StaffResponse toStaffResponse(BarbershopStaff st) {
        User b = st.getBarber();
        BarberProfile profile = barberProfileRepository.findByUser_Id(b.getId()).orElse(null);
        return new StaffResponse(
                st.getId(),
                b.getId(),
                b.getName(),
                b.getEmail(),
                b.getPhone(),
                st.getPosition(),
                st.getEmploymentStatus(),
                st.getJoinedAt() != null ? st.getJoinedAt().toString() : null,
                profile != null ? profile.getRatingAverage() : BigDecimal.ZERO,
                profile != null ? profile.getTotalCompleted() : 0,
                profile != null ? profile.getAvailabilityStatus() : "available",
                b.getPhoto()
        );
    }

    private String blankToNull(String str) {
        return str == null || str.isBlank() ? null : str.trim();
    }
}
