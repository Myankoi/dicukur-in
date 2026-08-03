package com.dicukur.app.endpoint;

import com.dicukur.app.barbershop.dto.BarbershopDetailResponse;
import com.dicukur.app.barbershop.dto.NearbyBarbershopResponse;
import com.dicukur.app.barbershop.service.BarbershopDiscoveryService;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.RolesAllowed;

import java.util.List;

@BrowserCallable
@RolesAllowed("CUSTOMER")
public class BarbershopEndpoint {

    private final BarbershopDiscoveryService discoveryService;

    public BarbershopEndpoint(BarbershopDiscoveryService discoveryService) {
        this.discoveryService = discoveryService;
    }

    public List<NearbyBarbershopResponse> searchNearby(Long addressId, double radiusKm) {
        return discoveryService.searchNearby(addressId, radiusKm);
    }

    public BarbershopDetailResponse getDetail(Long id) {
        return discoveryService.getDetail(id);
    }
}
