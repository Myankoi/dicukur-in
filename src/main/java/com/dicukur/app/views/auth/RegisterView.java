package com.dicukur.app.views.auth;

import com.dicukur.app.user.service.UserService;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.html.H1;
import com.vaadin.flow.component.html.Paragraph;
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

@Route("register")
@PageTitle("Daftar | dicukur.in")
@AnonymousAllowed
public class RegisterView extends VerticalLayout {

    private final UserService userService;

    public RegisterView(UserService userService) {
        this.userService = userService;

        setSizeFull();
        setAlignItems(Alignment.CENTER);
        setJustifyContentMode(JustifyContentMode.CENTER);

        H1 title = new H1("Daftar Akun");

        TextField nameField = new TextField("Nama Lengkap");
        nameField.setRequired(true);
        nameField.setWidthFull();
        nameField.setMaxWidth("320px");

        EmailField emailField = new EmailField("Email");
        emailField.setRequired(true);
        emailField.setWidthFull();
        emailField.setMaxWidth("320px");

        TextField phoneField = new TextField("No. Telepon");
        phoneField.setWidthFull();
        phoneField.setMaxWidth("320px");
        phoneField.setPlaceholder("08xxxxxxxxxx");

        PasswordField passwordField = new PasswordField("Password");
        passwordField.setRequired(true);
        passwordField.setWidthFull();
        passwordField.setMaxWidth("320px");
        passwordField.setMinLength(6);

        PasswordField confirmPasswordField = new PasswordField("Konfirmasi Password");
        confirmPasswordField.setRequired(true);
        confirmPasswordField.setWidthFull();
        confirmPasswordField.setMaxWidth("320px");

        Button registerButton = new Button("Daftar", e -> {
            // Validasi field
            String name = nameField.getValue().trim();
            String email = emailField.getValue().trim();
            String phone = phoneField.getValue().trim();
            String password = passwordField.getValue();
            String confirmPassword = confirmPasswordField.getValue();

            if (name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                Notification.show("Nama, email, dan password wajib diisi", 3000,
                        Notification.Position.TOP_CENTER)
                        .addThemeVariants(NotificationVariant.LUMO_ERROR);
                return;
            }

            if (password.length() < 6) {
                Notification.show("Password minimal 6 karakter", 3000,
                        Notification.Position.TOP_CENTER)
                        .addThemeVariants(NotificationVariant.LUMO_ERROR);
                return;
            }

            if (!password.equals(confirmPassword)) {
                Notification.show("Password dan konfirmasi tidak cocok", 3000,
                        Notification.Position.TOP_CENTER)
                        .addThemeVariants(NotificationVariant.LUMO_ERROR);
                return;
            }

            try {
                userService.registerCustomer(name, email, phone, password);
                Notification.show("Registrasi berhasil! Silakan login.", 3000,
                        Notification.Position.TOP_CENTER)
                        .addThemeVariants(NotificationVariant.LUMO_SUCCESS);

                // Redirect ke login
                getUI().ifPresent(ui -> ui.navigate("login"));
            } catch (IllegalArgumentException ex) {
                Notification.show(ex.getMessage(), 3000,
                        Notification.Position.TOP_CENTER)
                        .addThemeVariants(NotificationVariant.LUMO_ERROR);
            }
        });
        registerButton.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        registerButton.setWidthFull();
        registerButton.setMaxWidth("320px");

        Paragraph loginLink = new Paragraph(new RouterLink("Sudah punya akun? Login", LoginView.class));

        add(title, nameField, emailField, phoneField, passwordField, confirmPasswordField,
                registerButton, loginLink);
    }
}
