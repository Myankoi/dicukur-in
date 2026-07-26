package com.dicukur.app.views.admin;

import com.dicukur.app.views.components.PlaceholderPage;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "admin/registrations", layout = MainLayout.class)
@PageTitle("Pendaftaran | dicukur.in")
@RolesAllowed("ADMIN")
public class AdminRegistrationsView extends PlaceholderPage {
    public AdminRegistrationsView() {
        super("Pendaftaran", "Review pendaftaran barber mandiri dan usaha barbershop.");
    }
}
