package com.dicukur.app.views.owner;

import com.dicukur.app.views.components.PlaceholderPage;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "owner/staff", layout = MainLayout.class)
@PageTitle("Karyawan | dicukur.in")
@RolesAllowed("OWNER")
public class OwnerStaffView extends PlaceholderPage {
    public OwnerStaffView() {
        super("Karyawan", "Tambah, aktifkan, nonaktifkan, dan pantau performa barber karyawan.");
    }
}
