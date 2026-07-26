package com.dicukur.app.views.layout;

import com.vaadin.flow.component.applayout.AppLayout;
import com.vaadin.flow.component.applayout.DrawerToggle;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
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
        title.getStyle()
                .set("font-size", "var(--lumo-font-size-l)")
                .set("margin", "0");

        // nama user yang login
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        String username = (auth != null && auth.isAuthenticated()) ? auth.getName() : "";

        Span userInfo = new Span(username);
        userInfo.getStyle()
                .set("color", "var(--lumo-secondary-text-color)")
                .set("font-size", "var(--lumo-font-size-s)");

        // tombol logout
        Button logoutButton = new Button("Logout", VaadinIcon.SIGN_OUT.create(), e -> {
            getUI().ifPresent(ui -> ui.getPage().setLocation("/logout"));
        });
        logoutButton.addThemeVariants(ButtonVariant.LUMO_SMALL, ButtonVariant.LUMO_TERTIARY);

        HorizontalLayout header = new HorizontalLayout(
                new DrawerToggle(), title, userInfo, logoutButton);
        header.setDefaultVerticalComponentAlignment(FlexComponent.Alignment.CENTER);
        header.expand(title);
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
                break;

            case "ROLE_OWNER":
                nav.addItem(new SideNavItem("Dashboard", "/owner", VaadinIcon.DASHBOARD.create()));
                break;

            case "ROLE_BARBER":
                nav.addItem(new SideNavItem("Dashboard", "/barber", VaadinIcon.DASHBOARD.create()));
                break;

            case "ROLE_CUSTOMER":
                nav.addItem(new SideNavItem("Dashboard", "/customer", VaadinIcon.DASHBOARD.create()));
                break;
        }

        VerticalLayout drawerContent = new VerticalLayout(nav);
        drawerContent.setPadding(false);
        drawerContent.setSpacing(false);

        addToDrawer(drawerContent);
    }
}