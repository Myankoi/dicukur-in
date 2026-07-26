package com.dicukur.app.views.admin;

import com.dicukur.app.views.components.PlaceholderPage;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "admin/services", layout = MainLayout.class)
@PageTitle("Layanan | dicukur.in")
@RolesAllowed("ADMIN")
public class AdminServicesView extends PlaceholderPage {
    public AdminServicesView() {
        super("Layanan", "Kelola katalog layanan, harga, durasi, dan status aktif.");
    }
}
