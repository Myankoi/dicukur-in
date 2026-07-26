package com.dicukur.app.views.customer;

import com.dicukur.app.views.components.PlaceholderPage;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "customer/bookings", layout = MainLayout.class)
@PageTitle("Pesanan Saya | dicukur.in")
@RolesAllowed("CUSTOMER")
public class CustomerBookingsView extends PlaceholderPage {
    public CustomerBookingsView() {
        super("Pesanan Saya", "Pantau status booking aktif dan riwayat layanan.");
    }
}
