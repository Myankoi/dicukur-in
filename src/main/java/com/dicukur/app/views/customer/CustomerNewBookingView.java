package com.dicukur.app.views.customer;

import com.dicukur.app.views.components.PlaceholderPage;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "customer/bookings/new", layout = MainLayout.class)
@PageTitle("Pesan Barber | dicukur.in")
@RolesAllowed("CUSTOMER")
public class CustomerNewBookingView extends PlaceholderPage {
    public CustomerNewBookingView() {
        super("Pesan Barber", "Pilih alamat, layanan, barber, jadwal, dan cek estimasi harga.");
    }
}
