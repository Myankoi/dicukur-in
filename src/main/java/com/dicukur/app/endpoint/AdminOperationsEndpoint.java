package com.dicukur.app.endpoint;

import com.dicukur.app.admin.dto.*;
import com.dicukur.app.admin.service.AdminOperationsService;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;
import java.util.List;

@BrowserCallable
@RolesAllowed({"ADMIN", "Admin", "ROLE_ADMIN"})
public class AdminOperationsEndpoint {
    private final AdminOperationsService service;
    public AdminOperationsEndpoint(AdminOperationsService service) { this.service = service; }
    public List<AdminBarbershopResponse> getBarbershops() { return service.getBarbershops(); }
    public AdminBarbershopResponse toggleBarbershopStatus(Long id) { return service.toggleBarbershopStatus(id); }
    public List<PricingRuleResponse> getPricingRules() { return service.getPricingRules(); }
    public PricingRuleResponse savePricingRule(Long id, @Valid PricingRuleRequest request) { return service.savePricingRule(id, request); }
    public PricingRuleResponse togglePricingRule(Long id) { return service.togglePricingRule(id); }
    public void reassignBooking(Long bookingId, Long barberId) { service.reassignBooking(bookingId, barberId); }
    public List<com.dicukur.app.user.dto.UserResponse> getAssignableBarbers() { return service.getAssignableBarbers(); }
}
