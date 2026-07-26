# prompt_design.md — Design System & UI Prompt untuk dicukur.in

Gunakan prompt ini sebagai arahan desain UI/UX dan design system aplikasi **dicukur.in**, yaitu aplikasi web pemesanan barber datang ke rumah. Aplikasi dibangun menggunakan **Vaadin Flow server-side + Spring Boot**, sehingga seluruh halaman utama dibuat sebagai Java View, bukan React, Hilla, atau TypeScript views.

---

## 1. Konteks Produk

**dicukur.in** adalah aplikasi web untuk memesan layanan barber ke rumah. Sistem mendukung beberapa jenis pengguna:

1. **Customer** — memesan layanan barber ke alamat rumah.
2. **Barber** — menerima pesanan, mengatur jadwal, dan memperbarui status layanan.
3. **Owner** — pemilik usaha/barbershop yang dapat mengelola usaha dan karyawan barber.
4. **Admin** — memverifikasi pendaftaran barber/usaha, mengelola data master, dan melihat laporan.

Tujuan utama UI adalah membuat proses pemesanan cukur menjadi cepat, jelas, dan terpercaya, tanpa antre serta dengan jadwal yang teratur.

---

## 2. Prinsip Desain

Gunakan prinsip berikut pada seluruh UI:

1. **Praktis** — pengguna harus bisa menyelesaikan proses utama dengan langkah sesingkat mungkin.
2. **Jelas** — status pesanan, harga, jadwal, dan tindakan berikutnya harus mudah dipahami.
3. **Terpercaya** — tampilkan informasi verifikasi, rating, dokumen, dan status approval dengan rapi.
4. **Responsif** — UI harus nyaman digunakan di desktop dan mobile browser.
5. **Konsisten** — komponen, warna, spacing, dan pola tombol harus seragam.
6. **Tidak berlebihan** — hindari animasi atau dekorasi yang tidak membantu proses bisnis.

---

## 3. Karakter Visual Brand

Brand dicukur.in harus terasa:

- Modern
- Bersih
- Maskulin secukupnya
- Profesional
- Lokal dan mudah dipahami
- Tidak terlalu formal seperti sistem kantor
- Tidak terlalu ramai seperti marketplace besar

Tone visual: **clean service app**, bukan social media, bukan e-commerce penuh promo.

---

## 4. Design Tokens

Gunakan Vaadin Lumo Theme sebagai dasar. Custom CSS hanya untuk memperkuat identitas visual.

### 4.1 Warna

Gunakan palet berikut:

```css
:root {
  --dicukur-primary: #1f2937;
  --dicukur-primary-soft: #374151;
  --dicukur-accent: #d97706;
  --dicukur-accent-soft: #fef3c7;
  --dicukur-background: #f9fafb;
  --dicukur-surface: #ffffff;
  --dicukur-border: #e5e7eb;
  --dicukur-text: #111827;
  --dicukur-muted: #6b7280;
  --dicukur-success: #16a34a;
  --dicukur-warning: #d97706;
  --dicukur-danger: #dc2626;
  --dicukur-info: #2563eb;
}
```

Makna warna:

- `primary` untuk navbar, heading penting, dan identitas brand.
- `accent` untuk tombol utama seperti Pesan Sekarang, Approve, Simpan.
- `success` untuk status selesai, approved, paid.
- `warning` untuk pending, waiting verification, on review.
- `danger` untuk rejected, cancelled, failed.
- `info` untuk status perjalanan atau informasi netral.

### 4.2 Typography

Gunakan font default Lumo/Vaadin. Jangan memasukkan font eksternal dulu.

Aturan:

- Heading halaman: `H2`
- Subheading section: `H3`
- Body text: ukuran normal Vaadin
- Caption/helper text: kecil dan muted
- Hindari uppercase berlebihan

### 4.3 Spacing

Gunakan spacing konsisten:

```text
Small   : var(--lumo-space-s)
Medium  : var(--lumo-space-m)
Large   : var(--lumo-space-l)
XLarge  : var(--lumo-space-xl)
```

Aturan layout:

- Form jangan terlalu rapat.
- Dashboard gunakan card grid.
- Mobile layout harus stack vertikal.
- Desktop boleh pakai 2 kolom untuk form besar.

---

## 5. Struktur Theme Vaadin

Gunakan struktur:

```text
src/main/frontend/themes/dicukur-in/
├── styles.css
└── theme.json
```

Isi `theme.json`:

```json
{
  "lumoImports": [
    "typography",
    "color",
    "spacing",
    "badge",
    "utility"
  ]
}
```

Tambahkan annotation pada `Application.java`:

```java
@Theme("dicukur-in")
@SpringBootApplication
public class Application {
    public static void main(String[] args) {
        SpringApplication.run(Application.class, args);
    }
}
```

---

## 6. Gaya Komponen Global

### 6.1 Tombol

Gunakan pola:

- Primary action: `ButtonVariant.LUMO_PRIMARY`
- Danger action: `ButtonVariant.LUMO_ERROR`
- Secondary action: tombol biasa
- Small table action: `ButtonVariant.LUMO_SMALL`

Contoh fungsi tombol:

```text
Primary:
- Pesan Sekarang
- Simpan
- Approve
- Buat Jadwal

Secondary:
- Batal
- Kembali
- Reset Filter

Danger:
- Reject
- Hapus
- Batalkan Pesanan
```

### 6.2 Badge Status

Setiap status penting harus tampil sebagai badge.

Mapping status:

```text
PENDING / SUBMITTED / UNDER_REVIEW     → warning
APPROVED / VERIFIED / PAID / COMPLETED → success
REJECTED / CANCELLED / FAILED          → error
ON_THE_WAY / ARRIVED / IN_PROGRESS     → info
INACTIVE / SUSPENDED                   → contrast
```

### 6.3 Form

Aturan form:

- Label wajib jelas.
- Field wajib ditandai dengan required indicator.
- Validasi harus muncul dekat field.
- Tombol utama berada di kanan bawah atau bawah form.
- Form panjang dibagi menjadi section.

Contoh section form pendaftaran usaha:

```text
1. Data Pemilik
2. Data Usaha
3. Lokasi Usaha
4. Upload Dokumen
5. Review & Submit
```

### 6.4 Grid/Table

Aturan Grid:

- Selalu gunakan pagination/lazy loading jika data besar.
- Kolom aksi berada di kanan.
- Status tampil sebagai badge.
- Gunakan filter untuk data admin.
- Baris data penting harus bisa dibuka detailnya.

Kolom umum:

```text
Kode / Nama / Status / Tanggal / Aksi
```

---

## 7. Layout Aplikasi

Gunakan `AppLayout` sebagai layout utama.

Struktur layout:

```text
MainLayout
├── Navbar atas
│   ├── Logo dicukur.in
│   ├── Nama role / user
│   └── Logout
├── Drawer/sidebar
│   ├── Menu berdasarkan role
│   └── Section navigasi
└── Content area
```

### 7.1 Navbar

Isi navbar:

- Logo/text: `dicukur.in`
- Subtitle kecil: `Barber booking system`
- Nama user login
- Tombol logout

### 7.2 Sidebar Admin

Menu admin:

```text
Dashboard
Pendaftaran
Dokumen Verifikasi
User
Barber
Barbershop
Layanan
Booking
Pembayaran
Review
Laporan
```

### 7.3 Sidebar Owner

Menu owner:

```text
Dashboard
Profil Barbershop
Karyawan
Layanan
Jadwal Barber
Booking
Laporan
```

### 7.4 Sidebar Barber

Menu barber:

```text
Dashboard
Pesanan Masuk
Jadwal Saya
Layanan Saya
Riwayat Pekerjaan
Rating
```

### 7.5 Sidebar Customer

Menu customer:

```text
Dashboard
Pesan Barber
Alamat Saya
Pesanan Saya
Riwayat
Review
```

---

## 8. Halaman Wajib MVP

### 8.1 Auth

```text
/login
```

Isi:

- Logo dicukur.in
- LoginForm Vaadin
- Email
- Password
- Pesan error login
- Link daftar sebagai customer
- Link daftar sebagai barber/usaha, jika sudah dibuat

### 8.2 Admin Dashboard

Route:

```text
/admin
```

Isi card ringkasan:

- Total booking
- Booking pending
- Pendaftaran menunggu review
- Total barber aktif
- Total barbershop aktif
- Total transaksi

Tambahkan section:

- Pendaftaran terbaru
- Booking terbaru
- Pembayaran menunggu verifikasi

### 8.3 Admin Pendaftaran

Route:

```text
/admin/registrations
```

Fungsi:

- Lihat pendaftaran barber mandiri
- Lihat pendaftaran usaha/barbershop
- Filter status: submitted, under review, approved, rejected
- Buka detail pendaftaran
- Approve/reject

### 8.4 Detail Verifikasi Pendaftaran

Route:

```text
/admin/registrations/:id
```

Isi:

- Data pendaftar
- Jenis pendaftaran
- Data usaha jika business
- Data kompetensi jika independent
- Daftar dokumen
- Preview/link dokumen
- Catatan admin
- Tombol approve
- Tombol reject

### 8.5 Owner Dashboard

Route:

```text
/owner
```

Isi:

- Nama barbershop
- Status verifikasi
- Total booking bulan ini
- Total pendapatan
- Jumlah karyawan aktif
- Rating barbershop

### 8.6 Owner Kelola Karyawan

Route:

```text
/owner/staff
```

Fungsi:

- Lihat daftar karyawan
- Tambah barber sebagai karyawan
- Aktifkan/nonaktifkan karyawan
- Lihat performa karyawan

### 8.7 Barber Dashboard

Route:

```text
/barber
```

Isi:

- Pesanan hari ini
- Pesanan menunggu aksi
- Jadwal aktif
- Rating rata-rata
- Total pekerjaan selesai

### 8.8 Barber Jadwal

Route:

```text
/barber/schedules
```

Fungsi:

- Atur hari kerja
- Atur jam mulai dan jam selesai
- Tambah time off/libur
- Validasi jam selesai lebih besar dari jam mulai

### 8.9 Customer Dashboard

Route:

```text
/customer
```

Isi:

- Tombol Pesan Barber
- Pesanan aktif
- Alamat utama
- Riwayat terakhir

### 8.10 Customer Buat Booking

Route:

```text
/customer/bookings/new
```

Step UI:

```text
1. Pilih alamat
2. Pilih layanan
3. Pilih barber/barbershop
4. Pilih tanggal dan jam
5. Lihat estimasi harga
6. Konfirmasi booking
```

Ringkasan harga harus menampilkan:

```text
Harga layanan
Jarak
Biaya perjalanan
Total bayar
```

### 8.11 Detail Booking

Route:

```text
/bookings/:id
```

Isi:

- Kode booking
- Customer
- Barber
- Barbershop jika ada
- Jadwal
- Alamat
- Jarak
- Harga layanan
- Biaya perjalanan
- Total harga
- Status booking
- Status pembayaran
- Riwayat status
- Tombol aksi sesuai role

---

## 9. Pola UI Berdasarkan Role

### 9.1 Admin

Admin UI harus fokus pada:

- Review
- Approval
- Monitoring
- Master data
- Laporan

Admin tidak perlu UI yang terlalu dekoratif. Prioritaskan table, filter, detail panel, dan action button.

### 9.2 Owner

Owner UI harus fokus pada:

- Kesehatan usaha
- Karyawan
- Booking milik barbershop
- Pendapatan
- Rating

Gunakan dashboard card dan grid staff.

### 9.3 Barber

Barber UI harus fokus pada:

- Pesanan masuk
- Jadwal hari ini
- Tombol update status

Tombol status harus jelas dan besar, karena barber memakai aplikasi saat bekerja.

### 9.4 Customer

Customer UI harus fokus pada:

- Pesan cepat
- Status pesanan aktif
- Harga jelas
- Alamat mudah dipilih

Flow booking jangan terlalu panjang dalam satu halaman. Gunakan stepper sederhana atau section bertahap.

---

## 10. Komponen Reusable yang Harus Dibuat

Buat reusable components di:

```text
com.dicukur.app.views.components
```

Komponen yang disarankan:

```text
StatusBadge
MetricCard
PageHeader
ConfirmDialogHelper
PriceSummaryCard
BookingStatusTimeline
DocumentPreviewCard
EmptyState
RoleBasedMenu
```

### 10.1 StatusBadge

Input:

```text
status text
```

Output:

```text
Span dengan theme badge sesuai status
```

### 10.2 MetricCard

Dipakai untuk dashboard.

Isi:

```text
Judul
Angka utama
Deskripsi kecil
```

### 10.3 PriceSummaryCard

Dipakai di halaman booking.

Isi:

```text
Harga layanan
Jarak
Biaya perjalanan
Total harga
```

### 10.4 BookingStatusTimeline

Dipakai di detail booking.

Menampilkan status:

```text
Pending → Accepted → On The Way → Arrived → In Progress → Completed
```

---

## 11. UX Flow Utama

### 11.1 Flow Pendaftaran Barber Mandiri

```text
Buka halaman daftar barber
↓
Pilih tipe: Barber Mandiri
↓
Isi data diri
↓
Isi pengalaman/kompetensi
↓
Upload bukti kompetensi/portofolio
↓
Submit
↓
Status: Menunggu Review Admin
↓
Admin approve/reject
```

### 11.2 Flow Pendaftaran Usaha

```text
Buka halaman daftar partner
↓
Pilih tipe: Usaha/Barbershop
↓
Isi data owner
↓
Isi data usaha
↓
Isi lokasi usaha + koordinat
↓
Upload dokumen izin usaha/foto usaha
↓
Submit
↓
Status: Menunggu Review Admin
↓
Admin approve/reject
↓
Jika approved, owner bisa kelola karyawan
```

### 11.3 Flow Booking Customer

```text
Customer login
↓
Pilih alamat
↓
Pilih layanan
↓
Pilih barber/barbershop
↓
Pilih jadwal
↓
Sistem hitung jarak dan harga
↓
Customer konfirmasi
↓
Booking masuk status PENDING
↓
Barber menerima
↓
Status menjadi ACCEPTED
```

### 11.4 Flow Status Pesanan Barber

```text
PENDING
↓
ACCEPTED
↓
ON_THE_WAY
↓
ARRIVED
↓
IN_PROGRESS
↓
COMPLETED
```

Untuk status pembatalan:

```text
REJECTED
CANCELLED_BY_CUSTOMER
CANCELLED_BY_BARBER
CANCELLED_BY_ADMIN
NO_SHOW
```

---

## 12. Aturan Copywriting UI

Gunakan bahasa Indonesia yang jelas dan proper.

Contoh label:

```text
Pesan Barber
Buat Pesanan
Pilih Layanan
Pilih Alamat
Cek Ketersediaan
Total Harga
Biaya Perjalanan
Menunggu Konfirmasi
Dalam Perjalanan
Sedang Dilayani
Selesai
Batalkan Pesanan
```

Hindari teks terlalu teknis seperti:

```text
Submit Data Transaction
Update Entity
Execute Booking Flow
```

Gunakan pesan error yang spesifik:

```text
Jadwal barber sudah terisi pada waktu tersebut.
Alamat belum memiliki koordinat.
Dokumen izin usaha wajib diunggah.
Pembayaran belum diverifikasi.
```

---

## 13. Aturan Responsif

### Desktop

- Sidebar aktif.
- Dashboard card 3-4 kolom.
- Form panjang bisa 2 kolom.
- Grid bisa menampilkan banyak kolom.

### Mobile

- Sidebar menjadi drawer.
- Dashboard card 1 kolom.
- Form selalu 1 kolom.
- Grid penting diganti card list jika terlalu sempit.
- Tombol aksi utama dibuat full-width.

---

## 14. Styling CSS Dasar

Tambahkan di:

```text
src/main/frontend/themes/dicukur-in/styles.css
```

```css
html {
  --lumo-primary-color: #d97706;
  --lumo-primary-color-50pct: rgba(217, 119, 6, 0.5);
  --lumo-primary-color-10pct: rgba(217, 119, 6, 0.1);
  --lumo-base-color: #ffffff;
  --lumo-body-text-color: #111827;
  --lumo-secondary-text-color: #6b7280;
  --lumo-border-radius-m: 10px;
}

.page-container {
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: var(--lumo-space-l);
}

.page-header {
  margin-bottom: var(--lumo-space-l);
}

.page-title {
  margin: 0;
  font-size: var(--lumo-font-size-xxl);
  font-weight: 700;
  color: #111827;
}

.page-subtitle {
  margin-top: var(--lumo-space-xs);
  color: var(--lumo-secondary-text-color);
}

.metric-card {
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: var(--lumo-space-m);
}

.metric-label {
  color: var(--lumo-secondary-text-color);
  font-size: var(--lumo-font-size-s);
}

.metric-value {
  font-size: var(--lumo-font-size-xl);
  font-weight: 700;
  color: #111827;
}

.price-summary {
  border: 1px solid #e5e7eb;
  border-radius: 14px;
  padding: var(--lumo-space-m);
  background: #ffffff;
}

.price-total {
  font-size: var(--lumo-font-size-xl);
  font-weight: 700;
  color: #d97706;
}
```

---

## 15. Aturan Implementasi Vaadin

1. Jangan taruh business logic di View.
2. View hanya memanggil Service.
3. Gunakan Binder untuk form validation.
4. Gunakan Grid untuk data admin.
5. Gunakan Dialog untuk create/update data sederhana.
6. Gunakan ConfirmDialog untuk aksi berisiko.
7. Gunakan Notification untuk feedback sukses/gagal.
8. Gunakan `@RolesAllowed` pada setiap route role.
9. Jangan expose halaman admin tanpa security.
10. Jangan membuat query database langsung dari View.

---

## 16. Contoh Struktur View

```java
@Route(value = "admin/services", layout = MainLayout.class)
@PageTitle("Kelola Layanan")
@RolesAllowed("ADMIN")
public class AdminServiceView extends VerticalLayout {

    private final ServiceCatalogService serviceCatalogService;
    private final Grid<ServiceCatalog> grid = new Grid<>(ServiceCatalog.class, false);

    public AdminServiceView(ServiceCatalogService serviceCatalogService) {
        this.serviceCatalogService = serviceCatalogService;
        addClassName("page-container");

        add(
            createHeader(),
            createToolbar(),
            createGrid()
        );
    }
}
```

---

## 17. Hal yang Tidak Boleh Dilakukan di MVP

Jangan dulu membuat:

```text
- React/Hilla views
- Styling terlalu custom memakai framework lain
- Payment gateway real
- Google OAuth
- Live map tracking
- Chat realtime
- Mobile API kompleks
- Animasi berlebihan
```

Fokus MVP:

```text
Login → approval → kelola barber/barbershop → jadwal → booking → payment manual → rating → laporan
```

---

## 18. Checklist UI MVP

```text
[ ] Login page
[ ] MainLayout dengan navbar dan sidebar
[ ] Dashboard Admin
[ ] Dashboard Owner
[ ] Dashboard Barber
[ ] Dashboard Customer
[ ] Admin layanan CRUD
[ ] Admin pendaftaran review
[ ] Owner kelola karyawan
[ ] Barber kelola jadwal
[ ] Customer kelola alamat
[ ] Customer buat booking
[ ] Detail booking
[ ] Update status booking
[ ] Payment manual/cash
[ ] Review/rating
[ ] Laporan sederhana
```

---

## 19. Output yang Diharapkan dari AI/Coding Agent

Ketika menggunakan prompt ini untuk meminta bantuan AI/code assistant, hasil yang diharapkan adalah:

1. UI Vaadin berbasis Java, bukan React/Hilla.
2. Komponen reusable konsisten.
3. Tampilan bersih, responsif, dan mudah dipresentasikan.
4. Setiap halaman mengikuti role dan use case aplikasi.
5. Tidak ada business logic berat di View.
6. Nama route, class, dan komponen konsisten.
7. Styling mengikuti Lumo theme dan custom CSS sederhana.

---

## 20. Ringkasan Final

Design system dicukur.in harus mendukung aplikasi layanan barber panggilan yang praktis dan terpercaya. Fokus UI adalah mempercepat proses pemesanan, memperjelas status layanan, memudahkan admin memverifikasi partner, dan membantu owner/barber mengelola pekerjaan. Gunakan Vaadin Flow server-side dengan Lumo theme, komponen reusable, role-based layout, dan tampilan yang bersih tanpa kompleksitas frontend tambahan.
