package com.dicukur.app.views.admin;

import com.dicukur.app.views.components.PlaceholderPage;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "admin/payments", layout = MainLayout.class)
@PageTitle("Pembayaran | dicukur.in")
@RolesAllowed("ADMIN")
public class AdminPaymentsView extends PlaceholderPage {
    public AdminPaymentsView() {
        super("Pembayaran", "Verifikasi pembayaran transfer manual dan pantau status pembayaran.");
    }
}
