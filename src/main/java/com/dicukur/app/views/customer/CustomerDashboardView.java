package com.dicukur.app.views.customer;

import com.dicukur.app.views.components.MetricCard;
import com.dicukur.app.views.components.PageHeader;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H3;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "customer", layout = MainLayout.class)
@PageTitle("Customer Dashboard")
@RolesAllowed("CUSTOMER")
public class CustomerDashboardView extends VerticalLayout {

    public CustomerDashboardView() {
        addClassName("page-container");
        setPadding(false);
        setSpacing(false);

        Button newBookingButton = new Button("Pesan Barber", VaadinIcon.SCISSORS.create(),
                event -> getUI().ifPresent(ui -> ui.navigate("customer/bookings/new")));
        newBookingButton.addThemeVariants(ButtonVariant.LUMO_PRIMARY);

        Div metrics = new Div(
                new MetricCard("Pesanan Aktif", "0", "Booking yang sedang berjalan"),
                new MetricCard("Alamat Utama", "-", "Alamat default untuk pemesanan"),
                new MetricCard("Riwayat Terakhir", "-", "Booking terakhir Anda")
        );
        metrics.addClassName("metric-grid");

        Div section = new Div(
                new H3("Mulai Pesanan"),
                new Paragraph("Pilih alamat, layanan, barber, jadwal, lalu cek total harga sebelum konfirmasi."),
                newBookingButton
        );
        section.addClassName("dashboard-section");

        add(
                new PageHeader("Dashboard Customer", "Pesan barber ke rumah dan pantau status layanan Anda."),
                metrics,
                section
        );
    }
}
