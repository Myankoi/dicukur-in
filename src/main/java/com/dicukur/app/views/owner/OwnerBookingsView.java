package com.dicukur.app.views.owner;

import com.dicukur.app.views.components.PlaceholderPage;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "owner/bookings", layout = MainLayout.class)
@PageTitle("Booking Barbershop | dicukur.in")
@RolesAllowed("OWNER")
public class OwnerBookingsView extends PlaceholderPage {
    public OwnerBookingsView() {
        super("Booking Barbershop", "Pantau booking yang dikerjakan oleh karyawan barbershop.");
    }
}
