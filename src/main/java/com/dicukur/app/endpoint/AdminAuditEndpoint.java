package com.dicukur.app.endpoint;

import com.dicukur.app.admin.dto.AdminAuditLogResponse;
import com.dicukur.app.admin.service.AdminAuditService;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.RolesAllowed;

import java.util.List;

@BrowserCallable
@RolesAllowed({"ADMIN", "Admin", "ROLE_ADMIN"})
public class AdminAuditEndpoint {
    private final AdminAuditService service;

    public AdminAuditEndpoint(AdminAuditService service) {
        this.service = service;
    }

    public List<AdminAuditLogResponse> getRecent() {
        return service.getRecent();
    }
}
