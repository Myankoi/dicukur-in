package com.dicukur.app.views.barber;

import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "barber", layout = MainLayout.class)
@PageTitle("Barber Dashboard")
@RolesAllowed("BARBER")
public class BarberDashboardView extends com.vaadin.flow.component.orderedlayout.VerticalLayout {

    public BarberDashboardView() {
        add(
                new H2("Dashboard Barber"),
                new Paragraph("Lihat pesanan masuk, jadwal, dan update status layanan.")
        );
    }
}