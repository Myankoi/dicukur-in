package com.dicukur.app.endpoint;

import com.dicukur.app.servicecatalog.dto.ServiceOfferingRequest;
import com.dicukur.app.servicecatalog.dto.ServiceOfferingResponse;
import com.dicukur.app.servicecatalog.service.ServiceCatalogService;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;

import java.util.List;

@BrowserCallable
@RolesAllowed({"ADMIN", "Admin", "ROLE_ADMIN"})
public class AdminServiceEndpoint {

    private final ServiceCatalogService serviceCatalogService;

    public AdminServiceEndpoint(ServiceCatalogService serviceCatalogService) {
        this.serviceCatalogService = serviceCatalogService;
    }

    public List<ServiceOfferingResponse> getAllServices() {
        return serviceCatalogService.getAllServices();
    }

    public ServiceOfferingResponse createService(@Valid ServiceOfferingRequest request) {
        return serviceCatalogService.createService(request);
    }

    public ServiceOfferingResponse updateService(Long id, @Valid ServiceOfferingRequest request) {
        return serviceCatalogService.updateService(id, request);
    }

    public ServiceOfferingResponse toggleStatus(Long id) {
        return serviceCatalogService.toggleStatus(id);
    }
}
