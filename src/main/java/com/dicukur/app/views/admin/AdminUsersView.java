package com.dicukur.app.views.admin;

import com.dicukur.app.views.components.PlaceholderPage;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "admin/users", layout = MainLayout.class)
@PageTitle("User | dicukur.in")
@RolesAllowed("ADMIN")
public class AdminUsersView extends PlaceholderPage {
    public AdminUsersView() {
        super("User", "Kelola akun dan status pengguna.");
    }
}
