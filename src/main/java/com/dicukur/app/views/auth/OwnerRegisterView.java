package com.dicukur.app.views.auth;

import com.dicukur.app.user.service.UserService;
import com.vaadin.flow.component.button.Button;
import com.vaadin.flow.component.button.ButtonVariant;
import com.vaadin.flow.component.checkbox.Checkbox;
import com.vaadin.flow.component.html.*;
import com.vaadin.flow.component.notification.Notification;
import com.vaadin.flow.component.notification.NotificationVariant;
import com.vaadin.flow.component.orderedlayout.HorizontalLayout;
import com.vaadin.flow.component.orderedlayout.VerticalLayout;
import com.vaadin.flow.component.progressbar.ProgressBar;
import com.vaadin.flow.component.textfield.EmailField;
import com.vaadin.flow.component.textfield.PasswordField;
import com.vaadin.flow.component.textfield.TextArea;
import com.vaadin.flow.component.textfield.TextField;
import com.vaadin.flow.component.upload.Upload;
import com.vaadin.flow.component.upload.receivers.MemoryBuffer;
import com.vaadin.flow.router.PageTitle;
import com.vaadin.flow.router.Route;
import com.vaadin.flow.router.RouterLink;
import com.vaadin.flow.server.auth.AnonymousAllowed;

@Route("register/owner")
@PageTitle("Daftar Owner Barbershop | dicukur.in")
@AnonymousAllowed
public class OwnerRegisterView extends VerticalLayout {

    private final UserService userService;
    private int currentStep = 1;

    private String name, email, phone, password;
    private String shopName = "", shopAddress = "", ktpFileName = "", siupFileName = "";

    private final VerticalLayout stepContainer = new VerticalLayout();
    private final ProgressBar progressBar = new ProgressBar(0, 3, 1);
    private final Span stepLabel = new Span("Langkah 1 dari 3");

    public OwnerRegisterView(UserService userService) {
        this.userService = userService;
        setSizeFull();
        setAlignItems(Alignment.CENTER);
        setJustifyContentMode(JustifyContentMode.CENTER);

        H1 brandTitle = new H1("dicukur.in");
        H2 pageTitle = new H2("Daftar sebagai Owner Barbershop");

        progressBar.setWidthFull();
        stepContainer.setWidthFull();
        stepContainer.setPadding(false);

        Paragraph backLink = new Paragraph(
                new RouterLink("← Kembali ke pilihan tipe akun", RegisterView.class)
        );

        VerticalLayout card = new VerticalLayout(pageTitle, stepLabel, progressBar, stepContainer, backLink);
        card.setMaxWidth("480px");
        card.setWidthFull();

        showStep1();

        add(brandTitle, card);
    }

    private void showStep1() {
        currentStep = 1;
        updateProgress();
        stepContainer.removeAll();

        H3 title = new H3("Step 1: Identitas Pemilik");

        TextField nameField = new TextField("Nama Lengkap Pemilik");
        nameField.setRequired(true);
        nameField.setWidthFull();
        nameField.setValue(name != null ? name : "");

        EmailField emailField = new EmailField("Email");
        emailField.setRequired(true);
        emailField.setWidthFull();
        emailField.setValue(email != null ? email : "");

        TextField phoneField = new TextField("No. Telepon");
        phoneField.setPlaceholder("08xxxxxxxxxx");
        phoneField.setWidthFull();
        phoneField.setValue(phone != null ? phone : "");

        PasswordField passwordField = new PasswordField("Password");
        passwordField.setRequired(true);
        passwordField.setMinLength(6);
        passwordField.setWidthFull();

        PasswordField confirmField = new PasswordField("Konfirmasi Password");
        confirmField.setRequired(true);
        confirmField.setWidthFull();

        Button nextBtn = new Button("Lanjut →", e -> {
            String n = nameField.getValue().trim();
            String em = emailField.getValue().trim();
            String ph = phoneField.getValue().trim();
            String pw = passwordField.getValue();
            String cf = confirmField.getValue();

            if (n.isEmpty() || em.isEmpty() || pw.isEmpty()) {
                showError("Nama, email, dan password wajib diisi");
                return;
            }
            if (pw.length() < 6) {
                showError("Password minimal 6 karakter");
                return;
            }
            if (!pw.equals(cf)) {
                showError("Password dan konfirmasi tidak cocok");
                return;
            }
            name = n; email = em; phone = ph; password = pw;
            showStep2();
        });
        nextBtn.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        nextBtn.setWidthFull();

        stepContainer.add(title, nameField, emailField, phoneField, passwordField, confirmField, nextBtn);
    }

    private void showStep2() {
        currentStep = 2;
        updateProgress();
        stepContainer.removeAll();

        H3 title = new H3("Step 2: Data Barbershop");

        TextField shopNameField = new TextField("Nama Barbershop");
        shopNameField.setRequired(true);
        shopNameField.setWidthFull();
        shopNameField.setValue(shopName);

        TextArea shopAddressField = new TextArea("Alamat Barbershop");
        shopAddressField.setPlaceholder("Jl. ..., Kota, Provinsi");
        shopAddressField.setRequired(true);
        shopAddressField.setMaxLength(300);
        shopAddressField.setWidthFull();
        shopAddressField.setValue(shopAddress);

        Paragraph ktpInfo = new Paragraph("Upload foto KTP Pemilik (wajib)");

        MemoryBuffer ktpBuffer = new MemoryBuffer();
        Upload ktpUpload = new Upload(ktpBuffer);
        ktpUpload.setAcceptedFileTypes("image/jpeg", "image/png", "application/pdf");
        ktpUpload.setMaxFiles(1);
        ktpUpload.addSucceededListener(ev -> ktpFileName = ev.getFileName());

        Paragraph siupInfo = new Paragraph("Upload SIUP / Izin Usaha (jika sudah ada)");

        MemoryBuffer siupBuffer = new MemoryBuffer();
        Upload siupUpload = new Upload(siupBuffer);
        siupUpload.setAcceptedFileTypes("image/jpeg", "image/png", "application/pdf");
        siupUpload.setMaxFiles(1);
        siupUpload.addSucceededListener(ev -> siupFileName = ev.getFileName());

        HorizontalLayout navRow = new HorizontalLayout();
        Button backBtn = new Button("← Kembali", e -> showStep1());
        Button nextBtn = new Button("Lanjut →", e -> {
            String sn = shopNameField.getValue().trim();
            String sa = shopAddressField.getValue().trim();

            if (sn.isEmpty() || sa.isEmpty()) {
                showError("Nama dan alamat barbershop wajib diisi");
                return;
            }
            if (ktpFileName.isEmpty()) {
                showError("Foto KTP pemilik wajib diupload");
                return;
            }
            shopName = sn;
            shopAddress = sa;
            showStep3();
        });
        nextBtn.addThemeVariants(ButtonVariant.LUMO_PRIMARY);
        navRow.add(backBtn, nextBtn);
        navRow.setWidthFull();
        navRow.expand(nextBtn);

        stepContainer.add(title, shopNameField, shopAddressField, ktpInfo, ktpUpload, siupInfo, siupUpload, navRow);
    }

    private void showStep3() {
        currentStep = 3;
        updateProgress();
        stepContainer.removeAll();

        H3 title = new H3("Step 3: Konfirmasi & Persetujuan");

        UnorderedList summary = new UnorderedList(
                new ListItem("Nama Pemilik: " + name),
                new ListItem("Email: " + email),
                new ListItem("No. Telepon: " + (phone.isEmpty() ? "-" : phone)),
                new ListItem("Nama Barbershop: " + shopName),
                new ListItem("Alamat: " + shopAddress),
                new ListItem("KTP: " + ktpFileName),
                new ListItem("SIUP/Izin Usaha: " + (siupFileName.isEmpty() ? "Belum diupload" : siupFileName))
        );

        Paragraph infoNote = new Paragraph(
                "Setelah mendaftar, data barbershop Anda akan diverifikasi oleh Admin. " +
                "Anda bisa login setelah akun disetujui."
        );

        Checkbox agreeCheck = new Checkbox("Saya menyetujui Syarat & Ketentuan dicukur.in");

        HorizontalLayout navRow = new HorizontalLayout();
        Button backBtn = new Button("← Kembali", e -> showStep2());
        Button submitBtn = new Button("Daftar Sekarang", e -> {
            if (!agreeCheck.getValue()) {
                showError("Anda harus menyetujui Syarat & Ketentuan");
                return;
            }
            String notes = buildNotes();
            try {
                userService.registerOwnerApplicant(name, email, phone, password, notes);
                showSuccess("Pendaftaran berhasil! Akun akan aktif setelah persetujuan Admin.");
                getUI().ifPresent(ui -> ui.navigate("login"));
            } catch (IllegalArgumentException ex) {
                showError(ex.getMessage());
            }
        });
        submitBtn.addThemeVariants(ButtonVariant.LUMO_PRIMARY, ButtonVariant.LUMO_SUCCESS);
        navRow.add(backBtn, submitBtn);
        navRow.setWidthFull();
        navRow.expand(submitBtn);

        stepContainer.add(title, summary, infoNote, agreeCheck, navRow);
    }

    private String buildNotes() {
        return "{\"ktp\":\"" + ktpFileName + "\"," +
               "\"siup\":\"" + siupFileName + "\"," +
               "\"nama_barbershop\":\"" + shopName.replace("\"", "'") + "\"," +
               "\"alamat\":\"" + shopAddress.replace("\"", "'") + "\"}";
    }

    private void updateProgress() {
        progressBar.setValue(currentStep);
        stepLabel.setText("Langkah " + currentStep + " dari 3");
    }

    private void showError(String msg) {
        Notification.show(msg, 3000, Notification.Position.TOP_CENTER)
                .addThemeVariants(NotificationVariant.LUMO_ERROR);
    }

    private void showSuccess(String msg) {
        Notification.show(msg, 4000, Notification.Position.TOP_CENTER)
                .addThemeVariants(NotificationVariant.LUMO_SUCCESS);
    }
}
