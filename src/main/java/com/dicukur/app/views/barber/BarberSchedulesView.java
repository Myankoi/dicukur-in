package com.dicukur.app.views.barber;

import com.dicukur.app.views.components.PlaceholderPage;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "barber/schedules", layout = MainLayout.class)
@PageTitle("Jadwal Saya | dicukur.in")
@RolesAllowed("BARBER")
public class BarberSchedulesView extends PlaceholderPage {
    public BarberSchedulesView() {
        super("Jadwal Saya", "Atur hari kerja, jam tersedia, dan time off.");
    }
}
