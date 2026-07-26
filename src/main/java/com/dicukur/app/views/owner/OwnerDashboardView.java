package com.dicukur.app.views.owner;

import com.dicukur.app.views.components.MetricCard;
import com.dicukur.app.views.components.PageHeader;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H3;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "owner", layout = MainLayout.class)
@PageTitle("Owner Dashboard")
@RolesAllowed("OWNER")
public class OwnerDashboardView extends VerticalLayout {

    public OwnerDashboardView() {
        addClassName("page-container");
        setPadding(false);
        setSpacing(false);

        Div metrics = new Div(
                new MetricCard("Status Verifikasi", "Pending", "Usaha aktif setelah approval admin"),
                new MetricCard("Booking Bulan Ini", "0", "Pesanan milik barbershop"),
                new MetricCard("Karyawan Aktif", "0", "Barber yang siap menerima pesanan"),
                new MetricCard("Pendapatan", "Rp0", "Dari booking selesai")
        );
        metrics.addClassName("metric-grid");

        Div section = new Div(
                new H3("Ringkasan Usaha"),
                new Paragraph("Profil barbershop, performa karyawan, dan booking terbaru akan ditampilkan di sini.")
        );
        section.addClassName("dashboard-section");

        add(
                new PageHeader("Dashboard Owner", "Pantau kesehatan usaha, karyawan, booking, dan pendapatan."),
                metrics,
                section
        );
    }
}
