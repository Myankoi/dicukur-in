package com.dicukur.app.views.customer;

import com.dicukur.app.views.components.PlaceholderPage;
import com.dicukur.app.views.layout.MainLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.RolesAllowed;

@Route(value = "customer/addresses", layout = MainLayout.class)
@PageTitle("Alamat Saya | dicukur.in")
@RolesAllowed("CUSTOMER")
public class CustomerAddressesView extends PlaceholderPage {
    public CustomerAddressesView() {
        super("Alamat Saya", "Kelola alamat rumah dan koordinat untuk perhitungan jarak.");
    }
}
