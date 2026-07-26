package com.dicukur.app.views.owner;

import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "owner", layout = MainLayout.class)
@PageTitle("Owner Dashboard")
@RolesAllowed("OWNER")
public class OwnerDashboardView extends com.vaadin.flow.component.orderedlayout.VerticalLayout {

    public OwnerDashboardView() {
        add(
                new H2("Dashboard Owner"),
                new Paragraph("Kelola barbershop, karyawan, jadwal, dan laporan usaha.")
        );
    }
}