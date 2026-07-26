package com.dicukur.app.views.layout;

import com.vaadin.flow.component.applayout.AppLayout;
import com.vaadin.flow.component.applayout.DrawerToggle;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.icon.VaadinIcon;
import com.vaadin.flow.component.orderedlayout.FlexComponent;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.sidenav.SideNav;
import com.vaadin.flow.component.sidenav.SideNavItem;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;

public class MainLayout extends AppLayout {

    public MainLayout() {
        createHeader();
        createDrawer();
    }

    private void createHeader() {
        H1 title = new H1("dicukur.in");
        title.addClassName("app-brand-title");

        Span subtitle = new Span("Barber booking system");
        subtitle.addClassName("app-brand-subtitle");

        VerticalLayout brand = new VerticalLayout(title, subtitle);
        brand.setPadding(false);
        brand.setSpacing(false);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated()) ? auth.getName() : "";

        Span userInfo = new Span(username);
        userInfo.getStyle()
                .set("color", "var(--lumo-secondary-text-color)")
                .set("font-size", "var(--lumo-font-size-s)");

        Button logoutButton = new Button("Logout", VaadinIcon.SIGN_OUT.create(), e -> {
            getUI().ifPresent(ui -> ui.getPage().setLocation("/logout"));
        });
        logoutButton.addThemeVariants(ButtonVariant.LUMO_SMALL, ButtonVariant.LUMO_TERTIARY);

        HorizontalLayout header = new HorizontalLayout(
                new DrawerToggle(), brand, userInfo, logoutButton);
        header.setDefaultVerticalComponentAlignment(FlexComponent.Alignment.CENTER);
        header.expand(brand);
        header.setWidthFull();
        header.setPadding(true);
        header.setSpacing(true);

        addToNavbar(header);
    }

    private void createDrawer() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null)
            return;

        SideNav nav = new SideNav();

        String role = auth.getAuthorities().stream()
                .map(GrantedAuthority::getAuthority)
                .findFirst()
                .orElse("");

        switch (role) {
            case "ROLE_ADMIN":
                nav.addItem(new SideNavItem("Dashboard", "/admin", VaadinIcon.DASHBOARD.create()));
                nav.addItem(new SideNavItem("Pendaftaran", "/admin/registrations", VaadinIcon.CLIPBOARD_CHECK.create()));
                nav.addItem(new SideNavItem("User", "/admin/users", VaadinIcon.USERS.create()));
                nav.addItem(new SideNavItem("Layanan", "/admin/services", VaadinIcon.CUTLERY.create()));
                nav.addItem(new SideNavItem("Booking", "/admin/bookings", VaadinIcon.CALENDAR_CLOCK.create()));
                nav.addItem(new SideNavItem("Pembayaran", "/admin/payments", VaadinIcon.CREDIT_CARD.create()));
                nav.addItem(new SideNavItem("Laporan", "/admin/reports", VaadinIcon.CHART.create()));
                break;

            case "ROLE_OWNER":
                nav.addItem(new SideNavItem("Dashboard", "/owner", VaadinIcon.DASHBOARD.create()));
                nav.addItem(new SideNavItem("Profil Barbershop", "/owner/profile", VaadinIcon.SHOP.create()));
                nav.addItem(new SideNavItem("Karyawan", "/owner/staff", VaadinIcon.USERS.create()));
                nav.addItem(new SideNavItem("Booking", "/owner/bookings", VaadinIcon.CALENDAR_CLOCK.create()));
                nav.addItem(new SideNavItem("Laporan", "/owner/reports", VaadinIcon.CHART.create()));
                break;

            case "ROLE_BARBER":
                nav.addItem(new SideNavItem("Dashboard", "/barber", VaadinIcon.DASHBOARD.create()));
                nav.addItem(new SideNavItem("Pesanan Masuk", "/barber/bookings", VaadinIcon.INBOX.create()));
                nav.addItem(new SideNavItem("Jadwal Saya", "/barber/schedules", VaadinIcon.CALENDAR.create()));
                nav.addItem(new SideNavItem("Riwayat", "/barber/history", VaadinIcon.ARCHIVE.create()));
                break;

            case "ROLE_CUSTOMER":
                nav.addItem(new SideNavItem("Dashboard", "/customer", VaadinIcon.DASHBOARD.create()));
                nav.addItem(new SideNavItem("Pesan Barber", "/customer/bookings/new", VaadinIcon.SCISSORS.create()));
                nav.addItem(new SideNavItem("Alamat Saya", "/customer/addresses", VaadinIcon.HOME.create()));
                nav.addItem(new SideNavItem("Pesanan Saya", "/customer/bookings", VaadinIcon.CALENDAR_USER.create()));
                break;
        }

        Div drawerHeader = new Div(new Span("Navigasi"));
        drawerHeader.getStyle()
                .set("padding", "var(--lumo-space-m)")
                .set("font-weight", "600")
                .set("color", "var(--dicukur-muted)");

        VerticalLayout drawerContent = new VerticalLayout(drawerHeader, nav);
        drawerContent.setPadding(false);
        drawerContent.setSpacing(false);

        addToDrawer(drawerContent);
    }
}
