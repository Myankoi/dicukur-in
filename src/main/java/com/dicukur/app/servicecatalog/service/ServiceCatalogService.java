package com.dicukur.app.servicecatalog.service;

import com.dicukur.app.security.CurrentUserService;
import com.dicukur.app.service.entity.ServiceOffering;
import com.dicukur.app.service.repository.ServiceOfferingRepository;
import com.dicukur.app.servicecatalog.dto.ServiceOfferingRequest;
import com.dicukur.app.servicecatalog.dto.ServiceOfferingResponse;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ServiceCatalogService {

    private final ServiceOfferingRepository repository;
    private final CurrentUserService currentUserService;

    public ServiceCatalogService(ServiceOfferingRepository repository, CurrentUserService currentUserService) {
        this.repository = repository;
        this.currentUserService = currentUserService;
    }

    @Transactional(readOnly = true)
    public List<ServiceOfferingResponse> getAllServices() {
        return repository.findAll().stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ServiceOfferingResponse> getActiveServices() {
        return repository.findAll().stream()
                .filter(s -> "active".equalsIgnoreCase(s.getStatus()))
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public ServiceOfferingResponse createService(ServiceOfferingRequest req) {
        currentUserService.requireRole("Admin");

        ServiceOffering service = new ServiceOffering();
        service.setName(req.name().trim());
        service.setDescription(req.description() != null ? req.description().trim() : null);
        service.setPrice(req.price());
        service.setDuration(req.duration());
        service.setStatus(req.status() != null && !req.status().isBlank() ? req.status().toLowerCase() : "active");

        return toResponse(repository.save(service));
    }

    @Transactional
    public ServiceOfferingResponse updateService(Long id, ServiceOfferingRequest req) {
        currentUserService.requireRole("Admin");

        ServiceOffering service = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Layanan dengan ID " + id + " tidak ditemukan"));

        service.setName(req.name().trim());
        service.setDescription(req.description() != null ? req.description().trim() : null);
        service.setPrice(req.price());
        service.setDuration(req.duration());
        if (req.status() != null && !req.status().isBlank()) {
            service.setStatus(req.status().toLowerCase());
        }

        return toResponse(repository.save(service));
    }

    @Transactional
    public ServiceOfferingResponse toggleStatus(Long id) {
        currentUserService.requireRole("Admin");

        ServiceOffering service = repository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Layanan tidak ditemukan"));

        String newStatus = "active".equalsIgnoreCase(service.getStatus()) ? "inactive" : "active";
        service.setStatus(newStatus);

        return toResponse(repository.save(service));
    }

    private ServiceOfferingResponse toResponse(ServiceOffering s) {
        return new ServiceOfferingResponse(
                s.getId(),
                s.getName(),
                s.getDescription(),
                s.getPrice(),
                s.getDuration(),
                s.getStatus()
        );
    }
}
