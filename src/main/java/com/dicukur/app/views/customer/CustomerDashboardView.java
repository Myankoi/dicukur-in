package com.dicukur.app.views.customer;

import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "customer", layout = MainLayout.class)
@PageTitle("Customer Dashboard")
@RolesAllowed("CUSTOMER")
public class CustomerDashboardView extends com.vaadin.flow.component.orderedlayout.VerticalLayout {

    public CustomerDashboardView() {
        add(
                new H2("Dashboard Customer"),
                new Paragraph("Pesan barber ke rumah, lihat status pesanan, dan beri rating.")
        );
    }
}
