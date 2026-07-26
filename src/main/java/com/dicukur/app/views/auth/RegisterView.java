package com.dicukur.app.views.auth;

import com.dicukur.app.user.service.UserService;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.combobox.ComboBox;
import com.vaadin.flow.component.html.Div;
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

@Route("register")
@PageTitle("Daftar | dicukur.in")
@AnonymousAllowed
public class RegisterView extends VerticalLayout {

    private final UserService userService;

    public RegisterView(UserService userService) {
        this.userService = userService;

        setSizeFull();
        setPadding(false);
        setSpacing(false);
        addClassName("auth-shell");
        setAlignItems(Alignment.CENTER);
        setJustifyContentMode(JustifyContentMode.CENTER);

        VerticalLayout panel = new VerticalLayout();
        panel.addClassName("auth-panel");
        panel.setPadding(false);
        panel.setSpacing(false);

        H2 title = new H2("Daftar Akun");
        title.addClassName("auth-title");

        Paragraph subtitle = new Paragraph("Pilih tipe akun sesuai kebutuhan Anda");
        subtitle.addClassName("auth-subtitle");

        ComboBox<String> roleField = new ComboBox<>("Tipe Akun");
        roleField.setItems("Customer", "Barber Mandiri", "Owner Barbershop");
        roleField.setValue("Customer");
        roleField.setRequiredIndicatorVisible(true);
        roleField.setWidthFull();

        TextField nameField = new TextField("Nama Lengkap");
        nameField.setRequired(true);
        nameField.setWidthFull();

        EmailField emailField = new EmailField("Email");
        emailField.setRequired(true);
        emailField.setWidthFull();

        TextField phoneField = new TextField("No. Telepon");
        phoneField.setWidthFull();
        phoneField.setPlaceholder("08xxxxxxxxxx");

        PasswordField passwordField = new PasswordField("Password");
        passwordField.setRequired(true);
        passwordField.setWidthFull();
        passwordField.setMinLength(6);

        PasswordField confirmPasswordField = new PasswordField("Konfirmasi Password");
        confirmPasswordField.setRequired(true);
        confirmPasswordField.setWidthFull();

        Button registerButton = new Button("Daftar", e -> {
            String accountType = roleField.getValue();
            String name = nameField.getValue().trim();
            String email = emailField.getValue().trim();
            String phone = phoneField.getValue().trim();
            String password = passwordField.getValue();
            String confirmPassword = confirmPasswordField.getValue();

            if (accountType == null || name.isEmpty() || email.isEmpty() || password.isEmpty()) {
                Notification.show("Tipe akun, nama, email, dan password wajib diisi", 3000,
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
                if ("Customer".equals(accountType)) {
                    userService.registerCustomer(name, email, phone, password);
                    showSuccess("Registrasi berhasil. Silakan login.");
                } else {
                    String roleName = "Barber Mandiri".equals(accountType) ? "Barber" : "Owner";
                    userService.registerPartnerApplicant(name, email, phone, password, roleName);
                    showSuccess("Pendaftaran diterima. Akun mitra aktif setelah approval admin.");
                }

                getUI().ifPresent(ui -> ui.navigate("login"));
            } catch (IllegalArgumentException ex) {
                Notification.show(ex.getMessage(), 3000,
                        Notification.Position.TOP_CENTER)
                        .addThemeVariants(NotificationVariant.LUMO_ERROR);
            }
        });
        registerButton.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        registerButton.setWidthFull();

        Paragraph loginLink = new Paragraph(
                new Span("Sudah punya akun? "),
                new RouterLink("Login", LoginView.class)
        );
        loginLink.addClassName("auth-register-link");

        Div card = new Div(roleField, nameField, emailField, phoneField, passwordField, confirmPasswordField, registerButton);
        card.addClassName("auth-card");

        panel.add(title, subtitle, card, loginLink);
        add(panel);
    }

    private void showSuccess(String message) {
        Notification.show(message, 3000,
                        Notification.Position.TOP_CENTER)
                        .addThemeVariants(NotificationVariant.LUMO_SUCCESS);
    }
}
