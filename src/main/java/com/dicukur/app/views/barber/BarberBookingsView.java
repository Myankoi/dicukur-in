package com.dicukur.app.views.barber;

import com.dicukur.app.views.components.PlaceholderPage;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "barber/bookings", layout = MainLayout.class)
@PageTitle("Pesanan Masuk | dicukur.in")
@RolesAllowed("BARBER")
public class BarberBookingsView extends PlaceholderPage {
    public BarberBookingsView() {
        super("Pesanan Masuk", "Terima, tolak, dan update status booking dari customer.");
    }
}
