package com.dicukur.app.views.admin;

import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "admin", layout = MainLayout.class)
@PageTitle("Admin Dashboard")
@RolesAllowed("ADMIN")
public class AdminDashboardView extends com.vaadin.flow.component.orderedlayout.VerticalLayout {

    public AdminDashboardView() {
        add(
                new H2("Dashboard Admin"),
                new Paragraph("Kelola user, pendaftaran barber, layanan, dan laporan.")
        );
    }
}