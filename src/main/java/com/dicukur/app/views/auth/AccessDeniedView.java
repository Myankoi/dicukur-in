package com.dicukur.app.views.auth;

import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import jakarta.annotation.security.PermitAll;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Route("access-denied")
@PageTitle("Akses Ditolak | dicukur.in")
@PermitAll
public class AccessDeniedView extends VerticalLayout {

    public AccessDeniedView() {
        setSizeFull();
        setAlignItems(Alignment.CENTER);
        setJustifyContentMode(JustifyContentMode.CENTER);

        H2 title = new H2("Akses Ditolak");
        Paragraph message = new Paragraph("Anda tidak memiliki akses ke halaman ini.");
        Button backButton = new Button("Kembali ke Dashboard", event ->
                getUI().ifPresent(ui -> ui.navigate(resolveDashboard())));
        backButton.addThemeVariants(ButtonVariant.LUMO_PRIMARY);

        add(title, message, backButton);
    }

    private String resolveDashboard() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null) {
            return "login";
        }

        return auth.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .filter(authority -> authority.startsWith("ROLE_"))
                .findFirst()
                .map(role -> switch (role) {
                    case "ROLE_ADMIN" -> "admin";
                    case "ROLE_OWNER" -> "owner";
                    case "ROLE_BARBER" -> "barber";
                    case "ROLE_CUSTOMER" -> "customer";
                    default -> "login";
                })
                .orElse("login");
    }
}
