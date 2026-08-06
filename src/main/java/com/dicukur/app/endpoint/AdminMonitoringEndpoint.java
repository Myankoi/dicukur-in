package com.dicukur.app.endpoint;

import com.dicukur.app.admin.dto.AdminBookingResponse;
import com.dicukur.app.admin.dto.AdminReportResponse;
import com.dicukur.app.admin.service.AdminMonitoringService;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.RolesAllowed;

import java.util.List;

@BrowserCallable
@RolesAllowed({"ADMIN", "Admin", "ROLE_ADMIN"})
public class AdminMonitoringEndpoint {

    private final AdminMonitoringService adminMonitoringService;

    public AdminMonitoringEndpoint(AdminMonitoringService adminMonitoringService) {
        this.adminMonitoringService = adminMonitoringService;
    }

    public List<AdminBookingResponse> getAllBookings() {
        return adminMonitoringService.getAllBookings();
    }

    public AdminReportResponse getReportSummary() {
        return adminMonitoringService.getReportSummary();
    }
}
