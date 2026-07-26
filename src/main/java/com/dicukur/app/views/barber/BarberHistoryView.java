package com.dicukur.app.views.barber;

import com.dicukur.app.views.components.PlaceholderPage;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "barber/history", layout = MainLayout.class)
@PageTitle("Riwayat Pekerjaan | dicukur.in")
@RolesAllowed("BARBER")
public class BarberHistoryView extends PlaceholderPage {
    public BarberHistoryView() {
        super("Riwayat Pekerjaan", "Lihat booking selesai, pendapatan, dan rating layanan.");
    }
}
