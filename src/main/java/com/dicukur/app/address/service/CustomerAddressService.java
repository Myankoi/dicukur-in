package com.dicukur.app.address.service;

import com.dicukur.app.address.dto.AddressRequest;
import com.dicukur.app.address.dto.AddressResponse;
import com.dicukur.app.address.entity.CustomerAddress;
import com.dicukur.app.address.repository.CustomerAddressRepository;
import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.user.entity.User;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class CustomerAddressService {

    private final CustomerAddressRepository addressRepository;
    private final CurrentUserService currentUserService;

    public CustomerAddressService(CustomerAddressRepository addressRepository,
                                  CurrentUserService currentUserService) {
        this.addressRepository = addressRepository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<AddressResponse> getMyAddresses() {
        User customer = currentUserService.requireRole("Customer");
        return addressRepository.findByCustomer_IdOrderByIsDefaultDescUpdatedAtDesc(customer.getId())
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public AddressResponse save(AddressRequest request, Long id) {
        User customer = currentUserService.requireRole("Customer");
        validateCoordinates(request.latitude(), request.longitude());

        CustomerAddress address = id == null
                ? new CustomerAddress()
                : addressRepository.findByIdAndCustomer_Id(id, customer.getId())
                .orElseThrow(() -> new IllegalArgumentException("Alamat tidak ditemukan"));

        boolean firstAddress = id == null && addressRepository.findByCustomer_IdOrderByIsDefaultDescUpdatedAtDesc(customer.getId()).isEmpty();
        address.setCustomer(customer);
        address.setLabel(blankToNull(request.label()));
        address.setRecipientName(blankToNull(request.recipientName()));
        address.setPhone(blankToNull(request.phone()));
        address.setFullAddress(request.fullAddress().trim());
        address.setDistrict(blankToNull(request.district()));
        address.setCity(blankToNull(request.city()));
        address.setProvince(blankToNull(request.province()));
        address.setPostalCode(blankToNull(request.postalCode()));
        address.setLatitude(BigDecimal.valueOf(request.latitude()));
        address.setLongitude(BigDecimal.valueOf(request.longitude()));
        address.setNotes(blankToNull(request.notes()));
        address.setCreatedAt(address.getCreatedAt() == null ? LocalDateTime.now() : address.getCreatedAt());
        address.setUpdatedAt(LocalDateTime.now());

        if (request.isDefault() || firstAddress) {
            clearDefault(customer.getId(), address.getId());
            address.setDefault(true);
        }

        return toResponse(addressRepository.save(address));
    }

    @Transactional
    public void delete(Long id) {
        User customer = currentUserService.requireRole("Customer");
        CustomerAddress address = addressRepository.findByIdAndCustomer_Id(id, customer.getId())
                .orElseThrow(() -> new IllegalArgumentException("Alamat tidak ditemukan"));
        addressRepository.delete(address);

        if (address.isDefault()) {
            addressRepository.findByCustomer_IdOrderByIsDefaultDescUpdatedAtDesc(customer.getId())
                    .stream()
                    .findFirst()
                    .ifPresent(next -> {
                        next.setDefault(true);
                        addressRepository.save(next);
                    });
        }
    }

    @Transactional
    public void setDefault(Long id) {
        User customer = currentUserService.requireRole("Customer");
        CustomerAddress address = addressRepository.findByIdAndCustomer_Id(id, customer.getId())
                .orElseThrow(() -> new IllegalArgumentException("Alamat tidak ditemukan"));
        clearDefault(customer.getId(), id);
        address.setDefault(true);
        address.setUpdatedAt(LocalDateTime.now());
        addressRepository.save(address);
    }

    private void clearDefault(Long customerId, Long exceptId) {
        addressRepository.findByCustomer_IdOrderByIsDefaultDescUpdatedAtDesc(customerId)
                .stream()
                .filter(item -> !item.getId().equals(exceptId))
                .forEach(item -> item.setDefault(false));
    }

    private AddressResponse toResponse(CustomerAddress address) {
        return new AddressResponse(
                address.getId(), address.getLabel(), address.getRecipientName(), address.getPhone(),
                address.getFullAddress(), address.getDistrict(), address.getCity(), address.getProvince(),
                address.getPostalCode(), address.getLatitude().doubleValue(), address.getLongitude().doubleValue(),
                address.getNotes(), address.isDefault()
        );
    }

    private void validateCoordinates(double latitude, double longitude) {
        if (!Double.isFinite(latitude) || latitude < -90 || latitude > 90
                || !Double.isFinite(longitude) || longitude < -180 || longitude > 180) {
            throw new IllegalArgumentException("Koordinat alamat tidak valid");
        }
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
