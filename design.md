# DESIGN System & UI/UX Guidelines — dicukur.in

> **Tema Visual**: Classic Barber Pole ("Puter-Puteran Merah Biru Putih")  
> **Framework Target**: Vaadin Flow 24+ / Spring Boot / Lumo Custom Theme  
> **Versi**: 1.0.0 (MVP)

---

## 1. Konsep & Identitas Visual

Aplikasi **dicukur.in** mengambil inspirasi desain utama dari simbol ikonik barbershop klasik di seluruh dunia: **Barber Pole** (tiang putar merah, biru, dan putih).

### 1.1 Filosofi Warna
* **Crimson Red (`#D32F2F`)**: Membawa energi, presisi, kehangatan layanan, dan ketegasan aksi (Call To Action / Status Penting).
* **Barber Blue (`#1976D2` / `#0D47A1`)**: Melambangkan kepercayaan, profesionalisme, kebersihan, dan stabilitas platform.
* **Pure & Soft White (`#FFFFFF` / `#F8FAFC`)**: Latar belakang yang bersih, kontras tinggi, dan memberikan ruang bernapas (*whitespace*) bagi komponen UI.
* **Classic Chrome / Silver Gray (`#E2E8F0` / `#64748B`)**: Dipakai sebagai aksen border, pembatas, dan elemen netral yang terinspirasi dari gagang pisau cukur & tiang krom metalik.

### 1.2 Barber Pole Stripe Pattern (Visual Motif)
Aksen khas heliks berputar (*rotating helix*) diaplikasikan secara subtle pada:
* Top Navbar accent border (garis tipis 4px bergaris diagonal merah-biru-putih).
* Loading Indicators / Progress Bars khusus.
* Hero Banner Badge pada landing page & onboarding UI.
* Avatar frame atau badge verifikasi barbershop.

---

## 2. Palette Warna & Variabel CSS (Lumo Theme)

Seluruh variabel warna disesuaikan dengan token Vaadin Lumo (`frontend/themes/dicukur-theme/styles.css`).

```css
:root {
  /* Brand Primary & Secondary (Barber Pole Theme) */
  --barber-red: #D32F2F;
  --barber-red-hover: #B71C1C;
  --barber-red-light: #FFEBEE;
  
  --barber-blue: #1976D2;
  --barber-blue-dark: #0D47A1;
  --barber-blue-hover: #1565C0;
  --barber-blue-light: #E3F2FD;

  --barber-pole-stripe: repeating-linear-gradient(
    -45deg,
    #D32F2F,
    #D32F2F 12px,
    #FFFFFF 12px,
    #FFFFFF 20px,
    #1976D2 20px,
    #1976D2 32px,
    #FFFFFF 32px,
    #FFFFFF 40px
  );

  /* Vaadin Lumo Overrides */
  --lumo-primary-color: var(--barber-blue);
  --lumo-primary-color-50pct: rgba(25, 118, 210, 0.5);
  --lumo-primary-color-10pct: rgba(25, 118, 210, 0.1);
  --lumo-primary-contrast-color: #ffffff;

  --lumo-error-color: var(--barber-red);
  --lumo-error-color-10pct: var(--barber-red-light);

  /* Backgrounds & Surfaces */
  --lumo-base-color: #FFFFFF;
  --lumo-body-text-color: #1E293B;
  --lumo-secondary-text-color: #64748B;
  --lumo-contrast-5pct: #F8FAFC;
  --lumo-contrast-10pct: #F1F5F9;
  --lumo-contrast-20pct: #E2E8F0;

  /* Typography */
  --lumo-font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  --lumo-border-radius-m: 8px;
  --lumo-border-radius-l: 12px;
}
```

---

## 3. Tipografi & Tata Letak

### 3.1 Font Family
* **Primary Font**: `Plus Jakarta Sans` / `Inter` (memberikan kesan modern, bersih, dan sangat terbaca pada layar mobile/desktop).
* **Monospace / Code**: `JetBrains Mono` (untuk nomor resi/booking ID, koordinat lat/long).

### 3.2 Aturan Ukuran Font
| Elemen | Size (pt/rem) | Weight | Kegunaan |
|---|---|---|---|
| Display / Banner | 24pt (2.0rem) | Bold (700) | Title utama landing page, welcome hero |
| H1 (Page Title) | 18pt (1.5rem) | Bold (700) | Judul halaman dashboard / modul |
| H2 (Section Title) | 14pt (1.17rem) | SemiBold (600) | Header card, section form |
| H3 (Subtitle) | 12pt (1.0rem) | Medium (500) | Sub-header, nama barber, nama toko |
| Body Text | 10.5pt (0.875rem) | Regular (400) | Teks penjelasan, deskripsi layanan |
| Caption / Small | 9pt (0.75rem) | Regular (400) | Timestamp, status badge, footers |

---

## 4. Komponen UI & Styling Spesifik (Vaadin Flow)

### 4.1 Header Bar / Main Navigation (`AppLayout`)
* **Header Background**: Dark Chrome Blue (`#0D47A1`) dengan teks putih.
* **Barber Stripe Line**: Garis dekoratif 4px bergaris diagonal merah-biru-putih dipasang persis di perbatasan bawah header bar (`border-bottom`).
* **Logo**: Text "dicukur.in" dengan kata "dicukur" warna putih dan ".in" diberi badge merah bulat (`var(--barber-red)`).

### 4.2 Status Booking Badges
Status pesanan menggunakan badge berwarna kontras agar peran (Customer, Barber, Owner, Admin) dapat langsung mengidentifikasi alur:

| Status | Background | Text Color | Icon / Keterangan |
|---|---|---|---|
| `pending` | `#FEF3C7` (Amber) | `#D97706` | Menunggu konfirmasi barber |
| `accepted` | `#E3F2FD` (Blue Light) | `#1976D2` | Pesanan diterima barber |
| `on_the_way` | `#E0F2FE` (Cyan) | `#0284C7` | Barber dalam perjalanan |
| `arrived` | `#EDE9FE` (Purple) | `#6D28D9` | Barber sudah sampai |
| `in_progress` | `#FEF3C7` (Yellow/Stripes) | `#B45309` | Proses pemotongan rambut |
| `completed` | `#DCFCE7` (Green Light) | `#15803D` | Layanan selesai |
| `cancelled_*` / `rejected` | `#FFEBEE` (Red Light) | `#D32F2F` | Dibatalkan / ditolak |

### 4.3 Tombol Utilitas (Buttons)
* **Primary Button (CTA utama - Pesan/Terima/Simpan)**: `background: var(--barber-red); color: white;`
* **Secondary Button (Navigasi/Detail)**: `background: var(--barber-blue); color: white;`
* **Outline / Neutral Button**: `border: 1px solid #CBD5E1; color: #334155;`
* **Danger / Reject Button**: `background: #EF4444; color: white;`

### 4.4 Cards & Form Layouts
* **Border Radius**: Consistent `8px` (medium) atau `12px` (large).
* **Shadows**: Subtle soft shadow `box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);`.
* **Hover State**: Lift effect (`transform: translateY(-2px); transition: all 0.2s ease;`).

---

## 5. UI/UX Per Role Dashboard

### 5.1 Customer Dashboard (`/customer`)
* **Tone**: Ramah, fokus pada aksi cepat (*Book Barber Now*).
* **Visual**:
  * Quick Address Selector di bagian atas.
  * Card grid list Barber terdekat dengan rating ⭐ dan jarak (km).
  * Ringkasan biaya transparan (Harga Layanan + Biaya Perjalanan berdasarkan radius).

### 5.2 Barber Dashboard (`/barber`)
* **Tone**: Efisien, berfokus pada manajemen waktu & pesanan aktif.
* **Visual**:
  * Toggle Switch "Status Kerja" (Aktif/Libur).
  * Status Timeline Stepper untuk booking aktif (`pending` ➔ `accepted` ➔ `on_the_way` ➔ `arrived` ➔ `in_progress` ➔ `completed`).
  * Kalender/Tabel Jadwal Kerja Mingguan.

### 5.3 Owner Barbershop Dashboard (`/owner`)
* **Tone**: Professional business dashboard.
* **Visual**:
  * Summary Cards (Total Barber, Pendapatan Bulan Ini, Total Pesanan).
  * Data Grid Karyawan Barber dengan fitur On/Off status kerja.
  * Status Verifikasi Dokumen Usaha (Approved/Pending/Rejected banner).

### 5.4 Admin Dashboard (`/admin`)
* **Tone**: Control panel yang bersih dan aman.
* **Visual**:
  * Queue Approval Pendaftaran Usaha/Barbershop (Preview Dokumen PDF/Gambar).
  * System-wide Booking Monitor Grid.
  * Verifikasi Pembayaran Manual Transfer.

---

## 6. CSS Theme Implementation File (`frontend/themes/dicukur-theme/styles.css`)

```css
/* Custom Barber Pole Stripe Animation / Utilities */
.barber-pole-border {
  border-top: 4px solid transparent;
  border-image: var(--barber-pole-stripe) 1 linear-gradient;
}

.barber-pole-banner {
  background: var(--barber-pole-stripe);
  height: 6px;
  width: 100%;
}

.card-barber {
  background: #ffffff;
  border-radius: var(--lumo-border-radius-l);
  border: 1px solid var(--lumo-contrast-20pct);
  padding: 1.25rem;
  transition: transform 0.2s, box-shadow 0.2s;
}

.card-barber:hover {
  transform: translateY(-3px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: var(--barber-blue);
}

/* Status Badges */
.badge-status {
  padding: 4px 10px;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
```

---

## 7. Panduan Responsif & Aksesibilitas

1. **Mobile-First Layout**: Mengingat pemesan utama (Customer) & Barber akan sering mengakses via smartphone, Vaadin View menggunakan `VerticalLayout` & `FormLayout` dengan breakpoint responsif 1 kolom pada layar `< 768px`.
2. **High Contrast Text**: Teks pada tombol merah & biru wajib berwarna putih murni (`#FFFFFF`) untuk menjamin standar WCAG AA compliance.
3. **Touch Targets**: Setiap tombol aksi di mobile memiliki tinggi minimal `44px` agar mudah ditekan.
