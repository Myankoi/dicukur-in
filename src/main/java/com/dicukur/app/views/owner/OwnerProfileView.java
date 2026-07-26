package com.dicukur.app.views.owner;

import com.dicukur.app.views.components.PlaceholderPage;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "owner/profile", layout = MainLayout.class)
@PageTitle("Profil Barbershop | dicukur.in")
@RolesAllowed("OWNER")
public class OwnerProfileView extends PlaceholderPage {
    public OwnerProfileView() {
        super("Profil Barbershop", "Kelola identitas usaha, kontak, lokasi, dan status verifikasi.");
    }
}
