package com.dicukur.app.endpoint;

import com.dicukur.app.user.dto.AdminCreateUserRequest;
import com.dicukur.app.user.dto.AdminUpdateUserRequest;
import com.dicukur.app.user.dto.UserResponse;
import com.dicukur.app.user.service.AdminUserService;
import com.vaadin.hilla.BrowserCallable;
import jakarta.annotation.security.PermitAll;
import jakarta.annotation.security.RolesAllowed;
import jakarta.validation.Valid;

import java.util.List;

@BrowserCallable
@PermitAll
@RolesAllowed({"ADMIN", "Admin", "ROLE_ADMIN"})
public class AdminUserEndpoint {

    private final AdminUserService adminUserService;

    public AdminUserEndpoint(AdminUserService adminUserService) {
        this.adminUserService = adminUserService;
    }

    public List<UserResponse> getUsersByRole(String roleName) {
        return adminUserService.getUsersByRole(roleName);
    }

    public UserResponse createUser(@Valid AdminCreateUserRequest request) {
        return adminUserService.createUser(request);
    }

    public UserResponse updateUser(Long id, @Valid AdminUpdateUserRequest request) {
        return adminUserService.updateUser(id, request);
    }

    public void deleteUser(Long id) {
        adminUserService.deleteUser(id);
    }
}
