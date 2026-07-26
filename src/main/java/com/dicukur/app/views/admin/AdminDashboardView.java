package com.dicukur.app.views.admin;

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

@Route(value = "admin", layout = MainLayout.class)
@PageTitle("Admin Dashboard")
@RolesAllowed("ADMIN")
public class AdminDashboardView extends VerticalLayout {

    public AdminDashboardView() {
        addClassName("page-container");
        setPadding(false);
        setSpacing(false);

        Div metrics = new Div(
                new MetricCard("Total Booking", "0", "Seluruh booking di sistem"),
                new MetricCard("Booking Pending", "0", "Menunggu respon barber"),
                new MetricCard("Pendaftaran Review", "0", "Barber atau usaha menunggu approval"),
                new MetricCard("Total Transaksi", "Rp0", "Pembayaran terverifikasi")
        );
        metrics.addClassName("metric-grid");

        Div section = new Div(
                new H3("Aktivitas Terbaru"),
                new Paragraph("Pendaftaran, booking, dan pembayaran terbaru akan muncul di sini.")
        );
        section.addClassName("dashboard-section");

        add(
                new PageHeader("Dashboard Admin", "Kelola approval, operasional booking, pembayaran, dan laporan."),
                metrics,
                section
        );
    }
}
