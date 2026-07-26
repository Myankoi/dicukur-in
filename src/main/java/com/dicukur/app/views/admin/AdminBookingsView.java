package com.dicukur.app.views.admin;

import com.dicukur.app.views.components.PlaceholderPage;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "admin/bookings", layout = MainLayout.class)
@PageTitle("Booking | dicukur.in")
@RolesAllowed("ADMIN")
public class AdminBookingsView extends PlaceholderPage {
    public AdminBookingsView() {
        super("Booking", "Pantau booking dan status layanan di seluruh sistem.");
    }
}
