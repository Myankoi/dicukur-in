package com.dicukur.app.endpoint;

import com.dicukur.app.address.dto.AddressRequest;
import com.dicukur.app.address.dto.AddressResponse;
import com.dicukur.app.address.service.CustomerAddressService;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;

import java.util.List;

@BrowserCallable
@RolesAllowed("CUSTOMER")
public class CustomerAddressEndpoint {

    private final CustomerAddressService addressService;

    public CustomerAddressEndpoint(CustomerAddressService addressService) {
        this.addressService = addressService;
    }

    public List<AddressResponse> getMyAddresses() {
        return addressService.getMyAddresses();
    }

    public AddressResponse create(@Valid AddressRequest request) {
        return addressService.save(request, null);
    }

    public AddressResponse update(Long id, @Valid AddressRequest request) {
        return addressService.save(request, id);
    }

    public void delete(Long id) {
        addressService.delete(id);
    }

    public void setDefault(Long id) {
        addressService.setDefault(id);
    }
}
