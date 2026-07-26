package com.dicukur.app.views.admin;

import com.dicukur.app.views.components.PlaceholderPage;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "admin/reports", layout = MainLayout.class)
@PageTitle("Laporan | dicukur.in")
@RolesAllowed("ADMIN")
public class AdminReportsView extends PlaceholderPage {
    public AdminReportsView() {
        super("Laporan", "Lihat ringkasan booking, pendapatan, rating, dan approval.");
    }
}
