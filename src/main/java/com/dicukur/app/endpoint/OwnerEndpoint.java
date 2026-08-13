package com.dicukur.app.endpoint;

import com.dicukur.app.barbershop.dto.*;
import com.dicukur.app.barbershop.service.OwnerService;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;

import java.util.List;

@BrowserCallable
@RolesAllowed({"OWNER", "Owner", "ROLE_OWNER"})
public class OwnerEndpoint {

    private final OwnerService ownerService;

    public OwnerEndpoint(OwnerService ownerService) {
        this.ownerService = ownerService;
    }

    public OwnerDashboardSummaryResponse getDashboardSummary() {
        return ownerService.getDashboardSummary();
    }

    public BarbershopDetailResponse getMyBarbershop() {
        return ownerService.getMyBarbershop();
    }

    public BarbershopDetailResponse updateMyBarbershop(@Valid BarbershopUpdateRequest request) {
        return ownerService.updateMyBarbershop(request);
    }

    public List<StaffResponse> getMyStaff() {
        return ownerService.getMyStaff();
    }

    public StaffResponse addStaff(@Valid AddStaffRequest request) {
        return ownerService.addStaff(request);
    }

    public StaffResponse toggleStaffStatus(Long staffId) {
        return ownerService.toggleStaffStatus(staffId);
    }

    public List<BarbershopPhotoResponse> getMyPhotos() {
        return ownerService.getMyPhotos();
    }

    public BarbershopPhotoResponse addPhoto(String filePath, String caption) {
        return ownerService.addPhoto(filePath, caption);
    }

    public void deletePhoto(Long photoId) {
        ownerService.deletePhoto(photoId);
    }

    public BarbershopDetailResponse updateMainPhoto(String photoUrl) {
        return ownerService.updateMainPhoto(photoUrl);
    }
}
