package com.dicukur.app.security;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import java.io.IOException;

@Component
public class LoginSuccessHandler implements AuthenticationSuccessHandler {

    @Override
    public void onAuthenticationSuccess(
            HttpServletRequest request,
            HttpServletResponse response,
            Authentication authentication
    ) throws IOException, ServletException {

        String targetUrl = "/customer";

        boolean isAdmin = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));

        boolean isOwner = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_OWNER"));

        boolean isBarber = authentication.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_BARBER"));

        if (isAdmin) {
            targetUrl = "/admin";
        } else if (isOwner) {
            targetUrl = "/owner";
        } else if (isBarber) {
            targetUrl = "/barber";
        }

        response.sendRedirect(targetUrl);
    }
}