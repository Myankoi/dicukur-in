package com.dicukur.app.views;

import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.BeforeEnterEvent;
import com.vaadin.flow.router.BeforeEnterObserver;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.server.auth.AnonymousAllowed;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

@Route("")
@AnonymousAllowed
public class RootRedirectView extends VerticalLayout implements BeforeEnterObserver {

    @Override
    public void beforeEnter(BeforeEnterEvent event) {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            event.forwardTo("login");
            return;
        }

        String target = auth.getAuthorities().stream()
                .map(authority -> authority.getAuthority())
                .filter(authority -> authority.startsWith("ROLE_"))
                .findFirst()
                .map(this::dashboardFor)
                .orElse("login");

        event.forwardTo(target);
    }

    private String dashboardFor(String role) {
        return switch (role) {
            case "ROLE_ADMIN" -> "admin";
            case "ROLE_OWNER" -> "owner";
            case "ROLE_BARBER" -> "barber";
            case "ROLE_CUSTOMER" -> "customer";
            default -> "login";
        };
    }
}
