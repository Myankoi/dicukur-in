package com.dicukur.app.views.owner;

import com.dicukur.app.views.components.PlaceholderPage;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "owner/reports", layout = MainLayout.class)
@PageTitle("Laporan Usaha | dicukur.in")
@RolesAllowed("OWNER")
public class OwnerReportsView extends PlaceholderPage {
    public OwnerReportsView() {
        super("Laporan Usaha", "Lihat pendapatan, rating, dan kinerja karyawan.");
    }
}
