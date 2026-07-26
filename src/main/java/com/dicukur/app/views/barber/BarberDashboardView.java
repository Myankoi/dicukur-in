package com.dicukur.app.views.barber;

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

@Route(value = "barber", layout = MainLayout.class)
@PageTitle("Barber Dashboard")
@RolesAllowed("BARBER")
public class BarberDashboardView extends VerticalLayout {

    public BarberDashboardView() {
        addClassName("page-container");
        setPadding(false);
        setSpacing(false);

        Div metrics = new Div(
                new MetricCard("Pesanan Hari Ini", "0", "Jadwal yang perlu dikerjakan"),
                new MetricCard("Menunggu Aksi", "0", "Booking pending untuk diterima atau ditolak"),
                new MetricCard("Jadwal Aktif", "0", "Slot kerja yang tersedia"),
                new MetricCard("Rating", "0.0", "Rata-rata review customer")
        );
        metrics.addClassName("metric-grid");

        Div section = new Div(
                new H3("Tindakan Berikutnya"),
                new Paragraph("Pesanan masuk, status perjalanan, dan jadwal hari ini akan muncul di sini.")
        );
        section.addClassName("dashboard-section");

        add(
                new PageHeader("Dashboard Barber", "Kelola pesanan masuk, jadwal kerja, dan status layanan."),
                metrics,
                section
        );
    }
}
