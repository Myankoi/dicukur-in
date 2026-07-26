package com.dicukur.app.views.auth;

import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.html.Div;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.login.LoginForm;
import com.vaadin.flow.component.login.LoginI18n;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.router.*;
import com.vaadin.flow.server.auth.AnonymousAllowed;

@Route("login")
@PageTitle("Login | dicukur.in")
@AnonymousAllowed
public class LoginView extends VerticalLayout implements BeforeEnterObserver {

    private final LoginForm loginForm = new LoginForm();

    public LoginView() {
        setSizeFull();
        setPadding(false);
        setSpacing(false);
        addClassName("auth-shell");

        loginForm.setAction("login");
        loginForm.setForgotPasswordButtonVisible(false);
        loginForm.setI18n(createLoginI18n());

        Div hero = createHero();
        VerticalLayout panel = createPanel();

        HorizontalLayout shell = new HorizontalLayout(hero, panel);
        shell.setSizeFull();
        shell.setPadding(false);
        shell.setSpacing(false);
        shell.setFlexGrow(1, hero, panel);

        add(shell);
    }

    private Div createHero() {
        Div hero = new Div();
        hero.addClassName("auth-hero");
        hero.setWidth("50%");

        Div brand = new Div();
        brand.addClassName("auth-brand");
        brand.add(new H1("dicukur.in"), new Span("Potong lebih cerdas. Kelola lebih mudah."));

        hero.add(brand);
        return hero;
    }

    private VerticalLayout createPanel() {
        VerticalLayout panelWrap = new VerticalLayout();
        panelWrap.addClassName("auth-panel-wrap");
        panelWrap.setWidth("50%");
        panelWrap.setAlignItems(Alignment.CENTER);
        panelWrap.setJustifyContentMode(JustifyContentMode.CENTER);

        VerticalLayout panel = new VerticalLayout();
        panel.addClassName("auth-panel");
        panel.setPadding(false);
        panel.setSpacing(false);

        H2 title = new H2("Selamat Datang");
        title.addClassName("auth-title");

        Paragraph subtitle = new Paragraph("Masuk untuk melanjutkan");
        subtitle.addClassName("auth-subtitle");

        HorizontalLayout roleTabs = new HorizontalLayout(
                new Button("Pelanggan"),
                new Button("Mitra Barber"),
                new Button("Admin"));
        roleTabs.addClassName("auth-role-tabs");
        roleTabs.setSpacing(false);
        roleTabs.setWidthFull();
        roleTabs.getChildren()
                .filter(Button.class::isInstance)
                .map(Button.class::cast)
                .forEach(button -> {
                    button.addThemeVariants(ButtonVariant.LUMO_SMALL, ButtonVariant.LUMO_TERTIARY);
                    button.setWidthFull();
                });
        ((Button) roleTabs.getComponentAt(0)).addThemeVariants(ButtonVariant.LUMO_PRIMARY);

        Div card = new Div(loginForm);
        card.addClassName("auth-card");

        Paragraph registerLink = new Paragraph(
                new Span("Belum punya akun? "),
                new RouterLink("Daftar Akun Baru", RegisterView.class));
        registerLink.addClassName("auth-register-link");

        panel.add(title, subtitle, roleTabs, card, registerLink);
        panelWrap.add(panel);
        return panelWrap;
    }

    @Override
    public void beforeEnter(BeforeEnterEvent event) {
        if (event.getLocation().getQueryParameters().getParameters().containsKey("error")) {
            loginForm.setError(true);
        }
    }

    private LoginI18n createLoginI18n() {
        LoginI18n i18n = LoginI18n.createDefault();
        LoginI18n.Form form = i18n.getForm();
        form.setTitle("");
        form.setUsername("Email");
        form.setPassword("Password");
        form.setSubmit("Masuk");
        form.setForgotPassword("Lupa Password?");
        i18n.setForm(form);

        LoginI18n.ErrorMessage error = i18n.getErrorMessage();
        error.setTitle("Login gagal");
        error.setMessage("Email, password, atau status akun tidak valid.");
        i18n.setErrorMessage(error);
        return i18n;
    }
}
