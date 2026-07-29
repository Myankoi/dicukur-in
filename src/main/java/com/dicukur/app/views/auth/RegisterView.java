package com.dicukur.app.views.auth;

import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouterLink;
import com.vaadin.flow.server.auth.AnonymousAllowed;

@Route("register")
@PageTitle("Daftar | dicukur.in")
@AnonymousAllowed
public class RegisterView extends VerticalLayout {

    public RegisterView() {
        setSizeFull();
        setAlignItems(Alignment.CENTER);
        setJustifyContentMode(JustifyContentMode.CENTER);

        H1 brandTitle = new H1("dicukur.in");
        H2 pageTitle = new H2("Pilih Tipe Akun");

        Button customerBtn = new Button("Daftar sebagai Customer", e ->
                getUI().ifPresent(ui -> ui.navigate("register/customer")));
        customerBtn.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        customerBtn.setWidthFull();

        Button barberBtn = new Button("Daftar sebagai Barber Mandiri", e ->
                getUI().ifPresent(ui -> ui.navigate("register/barber")));
        barberBtn.setWidthFull();

        Button ownerBtn = new Button("Daftar sebagai Owner Barbershop", e ->
                getUI().ifPresent(ui -> ui.navigate("register/owner")));
        ownerBtn.setWidthFull();

        Paragraph loginLink = new Paragraph(
                new Span("Sudah punya akun? "),
                new RouterLink("Masuk disini", LoginView.class)
        );

        VerticalLayout card = new VerticalLayout(pageTitle, customerBtn, barberBtn, ownerBtn, loginLink);
        card.setMaxWidth("400px");
        card.setWidthFull();

        add(brandTitle, card);
    }
}
