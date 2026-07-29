package com.dicukur.app.views.auth;

import com.dicukur.app.user.service.UserService;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.html.H2;
import com.vaadin.flow.component.html.Paragraph;
import com.vaadin.flow.component.html.Span;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.notification.NotificationVariant;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.textfield.EmailField;
import com.vaadin.flow.component.textfield.PasswordField;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouterLink;
import com.vaadin.flow.server.auth.AnonymousAllowed;

@Route("register/customer")
@PageTitle("Daftar Customer | dicukur.in")
@AnonymousAllowed
public class CustomerRegisterView extends VerticalLayout {

    public CustomerRegisterView(UserService userService) {
        setSizeFull();
        setAlignItems(Alignment.CENTER);
        setJustifyContentMode(JustifyContentMode.CENTER);

        H1 brandTitle = new H1("dicukur.in");
        H2 pageTitle = new H2("Daftar sebagai Customer");

        TextField nameField = new TextField("Nama Lengkap");
        nameField.setRequired(true);
        nameField.setWidthFull();

        EmailField emailField = new EmailField("Email");
        emailField.setRequired(true);
        emailField.setWidthFull();

        TextField phoneField = new TextField("No. Telepon");
        phoneField.setPlaceholder("08xxxxxxxxxx");
        phoneField.setWidthFull();

        PasswordField passwordField = new PasswordField("Password");
        passwordField.setRequired(true);
        passwordField.setMinLength(6);
        passwordField.setWidthFull();

        PasswordField confirmPasswordField = new PasswordField("Konfirmasi Password");
        confirmPasswordField.setRequired(true);
        confirmPasswordField.setWidthFull();

        Button registerButton = new Button("Daftar Sekarang", e -> {
            String name = nameField.getValue().trim();
            String email = emailField.getValue().trim();
            String phone = phoneField.getValue().trim();
            String password = passwordField.getValue();
            String confirm = confirmPasswordField.getValue();

            if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                showError("Nama, email, dan password wajib diisi");
                return;
            }
            if (password.length() < 6) {
                showError("Password minimal 6 karakter");
                return;
            }
            if (!password.equals(confirm)) {
                showError("Password dan konfirmasi tidak cocok");
                return;
            }
            try {
                userService.registerCustomer(name, email, phone, password);
                showSuccess("Registrasi berhasil! Silakan login.");
                getUI().ifPresent(ui -> ui.navigate("login"));
            } catch (IllegalArgumentException ex) {
                showError(ex.getMessage());
            }
        });
        registerButton.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        registerButton.setWidthFull();

        Paragraph loginLink = new Paragraph(
                new Span("Sudah punya akun? "),
                new RouterLink("Masuk disini", LoginView.class)
        );

        Paragraph backLink = new Paragraph(
                new RouterLink("← Kembali ke pilihan tipe akun", RegisterView.class)
        );

        VerticalLayout card = new VerticalLayout(pageTitle, nameField, emailField, phoneField,
                passwordField, confirmPasswordField, registerButton, loginLink, backLink);
        card.setMaxWidth("420px");
        card.setWidthFull();

        add(brandTitle, card);
    }

    private void showError(String msg) {
        Notification.show(msg, 3000, Notification.Position.TOP_CENTER)
                .addThemeVariants(NotificationVariant.LUMO_ERROR);
    }

    private void showSuccess(String msg) {
        Notification.show(msg, 3000, Notification.Position.TOP_CENTER)
                .addThemeVariants(NotificationVariant.LUMO_SUCCESS);
    }
}
