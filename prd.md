# PRD — dicukur.in

## 1. Informasi Dokumen

| Item | Keterangan |
|---|---|
| Nama Produk | dicukur.in |
| Jenis Produk | Aplikasi web pemesanan barber datang ke rumah |
| Platform | Web server-side |
| Stack Utama | Vaadin Flow, Spring Boot, MariaDB, Spring Data JPA, Flyway, Spring Security |
| Target Demo | Pertengahan Agustus 2026 |
| Status Dokumen | Draft PRD MVP |

---

## 2. Ringkasan Produk

**dicukur.in** adalah aplikasi web untuk memesan layanan barber ke rumah pelanggan. Aplikasi ini memungkinkan pelanggan memilih layanan, alamat, jadwal, dan barber yang tersedia. Sistem juga mendukung pendaftaran usaha/barbershop yang memiliki karyawan.

Tujuan utama aplikasi adalah membuat layanan potong rambut lebih praktis, mengurangi kebutuhan antre di barbershop, serta membantu barber dan pemilik usaha mengelola jadwal, pesanan, dan layanan secara lebih teratur.

---

## 3. Latar Belakang Masalah

Proses potong rambut di barbershop sering terkendala antrean panjang, waktu tunggu yang tidak pasti, dan ketidakkonsistenan barber yang menangani pelanggan. Di sisi lain, barber atau usaha barbershop membutuhkan sistem untuk menerima pesanan, mengatur jadwal, mengelola karyawan, dan memantau layanan.

Aplikasi dicukur.in dibuat untuk menyelesaikan masalah tersebut dengan menyediakan sistem pemesanan barber ke rumah berbasis web.

---

## 4. Tujuan Produk

1. Mempermudah pelanggan memesan barber tanpa harus datang dan antre di barbershop.
2. Menyediakan sistem jadwal barber yang lebih teratur dan mengurangi benturan pemesanan.
3. Memungkinkan barber mandiri mendaftar dan diverifikasi oleh admin.
4. Memungkinkan usaha/barbershop mendaftar, diverifikasi, dan mengelola karyawan barber.
5. Menyediakan perhitungan harga berdasarkan layanan dan jarak lokasi.
6. Menyediakan laporan sederhana untuk admin, owner, dan barber.
7. Menyediakan alur demo yang jelas menggunakan Vaadin + Spring Boot.

---

## 5. Target Pengguna

| Pengguna | Deskripsi |
|---|---|
| Customer | Pengguna yang memesan layanan barber ke rumah |
| Owner | Pemilik usaha/barbershop yang mendaftarkan usaha dan mengelola karyawan |
| Barber | Barber yang bekerja di bawah usaha/barbershop, ditambahkan oleh Owner |
| Admin | Pengelola sistem yang memverifikasi pendaftaran, mengelola data, dan memantau laporan |

---

## 6. Role dan Hak Akses

| Role | Hak Akses Utama |
|---|---|
| Admin | Mengelola user, layanan, pendaftaran barbershop, dokumen verifikasi, approval, booking, pembayaran, dan laporan |
| Owner | Mendaftarkan barbershop, mengelola profil barbershop, menambahkan karyawan barber, layanan, jadwal, dan laporan usaha |
| Barber | Mengatur jadwal, melihat pesanan masuk, menerima/menolak pesanan, dan update status layanan |
| Customer | Mengelola alamat, membuat pesanan, melihat status pesanan, membayar, dan memberi rating |

---

## 7. Scope MVP

### 7.1 Fitur yang Masuk MVP

1. Login email dan password.
2. Role-based dashboard untuk Admin, Owner, Barber, dan Customer.
3. Pendaftaran usaha/barbershop oleh Owner.
4. Upload dokumen verifikasi barbershop.
5. Approval/reject pendaftaran barbershop oleh admin.
6. Manajemen barbershop oleh owner.
7. Manajemen karyawan barber oleh owner (barber ditambahkan oleh owner).
8. Manajemen layanan barber.
9. Manajemen alamat customer.
10. Manajemen jadwal barber.
11. Pembuatan booking.
12. Pengecekan ketersediaan jadwal barber.
13. Perhitungan jarak menggunakan latitude dan longitude.
14. Perhitungan harga layanan + biaya jarak.
15. Terima/tolak booking oleh barber.
16. Update status booking.
17. Pembayaran cash/manual transfer.
18. Rating dan ulasan.
19. Notifikasi dalam aplikasi.
20. Laporan sederhana.

### 7.2 Fitur di Luar MVP

1. Login Google OAuth 2.0.
2. Payment gateway asli.
3. Live tracking barber.
4. Chat real-time.
5. OTP WhatsApp/SMS.
6. Mobile app REST API.
7. Sistem refund otomatis.
8. Sistem komisi dan payout detail.
9. Multi-branch barbershop kompleks.
10. Integrasi Google Maps penuh.

---

## 8. User Story

### 8.1 Customer

1. Sebagai customer, saya ingin membuat akun agar dapat memesan layanan barber.
2. Sebagai customer, saya ingin menyimpan alamat rumah agar tidak perlu mengisi alamat berulang kali.
3. Sebagai customer, saya ingin memilih layanan potong rambut agar dapat mengetahui harga dan durasi.
4. Sebagai customer, saya ingin memilih barber yang tersedia agar dapat memesan sesuai jadwal.
5. Sebagai customer, saya ingin sistem menghitung harga berdasarkan jarak agar biaya lebih transparan.
6. Sebagai customer, saya ingin melihat status pesanan agar tahu proses layanan berjalan sampai mana.
7. Sebagai customer, saya ingin memberi rating setelah layanan selesai agar dapat menilai kualitas barber.

### 8.2 Barber

1. Sebagai barber, saya ingin mengatur jadwal kerja agar customer hanya dapat memesan pada waktu yang tersedia.
2. Sebagai barber, saya ingin menerima atau menolak pesanan agar saya dapat mengontrol pekerjaan saya.
3. Sebagai barber, saya ingin mengubah status pesanan agar customer mengetahui progres layanan.

### 8.3 Owner Barbershop

1. Sebagai owner, saya ingin mendaftarkan usaha barbershop agar usaha saya dapat menerima pesanan.
2. Sebagai owner, saya ingin mengunggah bukti usaha agar admin dapat melakukan approval.
3. Sebagai owner, saya ingin menambahkan karyawan barber agar pesanan dapat dikerjakan oleh barber yang tersedia.
4. Sebagai owner, saya ingin melihat laporan usaha agar dapat memantau performa barbershop.

### 8.4 Admin

1. Sebagai admin, saya ingin melihat pendaftaran barber dan usaha agar dapat memverifikasi kelayakan pendaftar.
2. Sebagai admin, saya ingin melihat dokumen yang diunggah pendaftar agar dapat memberi keputusan approval/reject.
3. Sebagai admin, saya ingin mengelola layanan agar data layanan tetap valid.
4. Sebagai admin, saya ingin melihat laporan booking dan pembayaran agar operasional dapat dipantau.

---

## 9. Functional Requirements

## 9.1 Autentikasi dan Otorisasi

### Requirement

1. Sistem harus menyediakan login menggunakan email dan password.
2. Sistem harus membedakan akses berdasarkan role: Admin, Owner, Barber, Customer.
3. Sistem harus mengarahkan user ke dashboard sesuai role setelah login.
4. Sistem harus menolak akses halaman jika role tidak sesuai.
5. Sistem harus menyediakan logout.
6. Password harus disimpan dalam bentuk hash BCrypt.

### Acceptance Criteria

- User dengan role Admin diarahkan ke `/admin`.
- User dengan role Owner diarahkan ke `/owner`.
- User dengan role Barber diarahkan ke `/barber`.
- User dengan role Customer diarahkan ke `/customer`.
- User tidak aktif tidak dapat login.

---

## 9.2 Pendaftaran Usaha/Barbershop

> **Catatan:** Tidak ada pendaftaran barber mandiri. Barber hanya bisa ditambahkan oleh Owner setelah barbershop disetujui admin.

### Requirement

1. User dapat mendaftar sebagai Owner dengan mengisi nama, email, nomor telepon, dan password.
2. Setelah login, Owner mendaftarkan barbershop dengan mengisi data usaha dan mengunggah dokumen.
3. Status pendaftaran barbershop awal adalah `submitted`.
4. Barbershop belum aktif sebelum disetujui admin.

### Acceptance Criteria

- Data pendaftaran barbershop tersimpan di sistem.
- Dokumen tersimpan sebagai file path, bukan BLOB di database.
- Admin dapat melihat pendaftaran dan dokumen.
- Setelah approved, barbershop aktif dan owner dapat menambahkan karyawan barber.
- Setelah rejected, sistem menyimpan alasan penolakan.

---

## 9.3 Manajemen Karyawan Barber oleh Owner

### Requirement

1. Owner yang sudah diapprove dapat menambahkan barber sebagai karyawan barbershop.
2. Owner mengisi data barber: nama, email, nomor telepon, dan password awal.
3. Sistem membuat akun user baru dengan role Barber dan langsung dikaitkan ke barbershop Owner.
4. Owner dapat mengaktifkan atau menonaktifkan karyawan.

### Acceptance Criteria

- Owner dapat melihat daftar karyawan barber miliknya.
- Barber baru langsung dapat login setelah ditambahkan owner.
- Barber nonaktif tidak dapat menerima booking.
- Booking menyimpan `barbershop_id` dari barbershop barber tersebut.

---

## 9.4 Manajemen Karyawan Barbershop

### Requirement

1. Owner dapat menambahkan barber sebagai karyawan barbershop.
2. Karyawan harus memiliki akun user dengan role Barber.
3. Owner dapat mengaktifkan atau menonaktifkan karyawan.
4. Booking milik karyawan dapat dikaitkan dengan barbershop.

### Acceptance Criteria

- Owner dapat melihat daftar karyawan.
- Owner dapat menambahkan karyawan dari user barber yang tersedia.
- Karyawan nonaktif tidak dapat menerima booking dari barbershop.
- Booking menyimpan `barbershop_id` jika barber bekerja di bawah barbershop.

---

## 9.5 Manajemen Layanan

### Requirement

1. Admin dapat membuat, mengubah, dan menonaktifkan layanan.
2. Layanan memiliki nama, deskripsi, harga, durasi, dan status.
3. Barber dapat dikaitkan dengan layanan tertentu.
4. Harga khusus per barber dapat diatur jika diperlukan.

### Acceptance Criteria

- Layanan aktif dapat dipilih saat booking.
- Layanan nonaktif tidak muncul untuk customer.
- Harga layanan disimpan sebagai snapshot pada booking detail.

---

## 9.6 Manajemen Alamat Customer

### Requirement

1. Customer dapat menambahkan alamat.
2. Alamat harus memiliki alamat lengkap, kota/kecamatan, latitude, dan longitude.
3. Customer dapat menentukan alamat utama.
4. Alamat yang dipakai booking harus disimpan sebagai snapshot.

### Acceptance Criteria

- Customer dapat memiliki lebih dari satu alamat.
- Booking tetap menyimpan alamat lama meskipun customer mengubah alamat profil.
- Sistem dapat menggunakan latitude dan longitude alamat untuk hitung jarak.

---

## 9.7 Manajemen Jadwal Barber

### Requirement

1. Barber dapat mengatur jadwal kerja mingguan.
2. Jadwal memiliki hari, jam mulai, jam selesai, dan status.
3. Barber dapat menambahkan time off/libur.
4. Sistem tidak boleh menerima booking di luar jadwal kerja.
5. Sistem tidak boleh menerima booking yang bertabrakan dengan time off.

### Acceptance Criteria

- Jadwal dengan jam selesai lebih kecil dari jam mulai ditolak.
- Customer hanya dapat booking pada jadwal barber yang aktif.
- Booking yang overlap dengan booking lain ditolak oleh backend.

---

## 9.8 Booking

### Requirement

1. Customer dapat membuat booking dengan memilih layanan, alamat, barber, tanggal, dan jam.
2. Sistem harus memvalidasi barber aktif dan terverifikasi.
3. Sistem harus memvalidasi layanan aktif.
4. Sistem harus mengecek jadwal barber.
5. Sistem harus mengecek benturan booking.
6. Sistem harus menghitung jarak antara lokasi customer dan lokasi asal barber/barbershop.
7. Sistem harus menghitung `travel_fee` dan `total_price`.
8. Booking menyimpan snapshot harga, alamat, koordinat, jarak, dan biaya perjalanan.

### Acceptance Criteria

- Booking berhasil dibuat jika semua validasi terpenuhi.
- Booking gagal jika jadwal bentrok.
- Booking gagal jika barber tidak aktif atau belum diverifikasi.
- Booking menyimpan `distance_km`, `travel_fee`, `service_subtotal`, dan `total_price`.

---

## 9.9 Perhitungan Harga dan Jarak

### Requirement

1. Sistem menghitung jarak menggunakan latitude dan longitude customer serta barber/barbershop.
2. Untuk MVP, sistem menggunakan rumus Haversine.
3. Sistem menggunakan pricing rule aktif untuk menghitung biaya jarak.
4. Formula harga:

```text
travel_fee = CEIL(MAX(0, distance_km - free_radius_km)) * price_per_km

total_price = service_subtotal + travel_fee
```

### Acceptance Criteria

- Jika jarak masih dalam radius gratis, `travel_fee` bernilai 0.
- Jika jarak melewati radius gratis, biaya dihitung per kilometer.
- Total harga tidak boleh dihitung dari input browser, tetapi dihitung ulang oleh backend.

---

## 9.10 Status Booking

### Requirement

Status booking minimal:

```text
pending
accepted
rejected
on_the_way
arrived
in_progress
completed
cancelled_by_customer
cancelled_by_barber
cancelled_by_admin
no_show
```

Alur normal:

```text
pending → accepted → on_the_way → arrived → in_progress → completed
```

### Acceptance Criteria

- Barber dapat menerima atau menolak booking.
- Barber dapat mengubah status sesuai urutan proses.
- Booking yang sudah completed tidak dapat dibatalkan.
- Perubahan status disimpan di booking status history.

---

## 9.11 Pembayaran

### Requirement

1. Sistem mendukung pembayaran cash dan transfer manual untuk MVP.
2. Payment memiliki metode, jumlah, status, bukti pembayaran, dan waktu pembayaran.
3. Untuk transfer manual, customer dapat mengunggah bukti pembayaran.
4. Admin dapat memverifikasi pembayaran manual.

### Acceptance Criteria

- Satu booking memiliki maksimal satu payment untuk MVP.
- Payment amount harus sama dengan total booking.
- Status pembayaran dapat berubah menjadi `paid` setelah diverifikasi.

---

## 9.12 Rating dan Ulasan

### Requirement

1. Customer dapat memberi rating setelah booking selesai.
2. Rating bernilai 1 sampai 5.
3. Satu booking hanya boleh memiliki satu review.
4. Admin dapat menyembunyikan review jika diperlukan.

### Acceptance Criteria

- Review hanya dapat dibuat untuk booking completed.
- Review hanya dapat dibuat oleh customer pemilik booking.
- Rating barber dapat dihitung dari review yang valid.

---

## 9.13 Notifikasi

### Requirement

1. Sistem membuat notifikasi saat booking dibuat.
2. Sistem membuat notifikasi saat booking diterima/ditolak.
3. Sistem membuat notifikasi saat status booking berubah.
4. Sistem membuat notifikasi saat pembayaran diverifikasi.

### Acceptance Criteria

- User dapat melihat daftar notifikasi.
- User dapat menandai notifikasi sebagai sudah dibaca.

---

## 9.14 Laporan

### Requirement

Admin dapat melihat:

1. Total booking.
2. Booking selesai.
3. Booking dibatalkan.
4. Total transaksi.
5. Pendapatan per barber.
6. Rating barber.
7. Pendaftaran yang menunggu approval.

Owner dapat melihat:

1. Total booking barbershop.
2. Pendapatan barbershop.
3. Kinerja karyawan barber.
4. Rating rata-rata.

Barber dapat melihat:

1. Riwayat pekerjaan.
2. Jumlah pesanan selesai.
3. Rating rata-rata.
4. Pendapatan dari booking yang selesai.

### Acceptance Criteria

- Admin dapat melihat laporan booking sederhana.
- Owner hanya dapat melihat data milik barbershop-nya.
- Barber hanya dapat melihat data miliknya sendiri.

---

## 10. Data Requirement

| Data | Keterangan |
|---|---|
| User | Akun pengguna semua role |
| Role | Hak akses pengguna |
| BarberProfile | Data khusus barber |
| Barbershop | Data usaha/barbershop |
| BarbershopStaff | Relasi barbershop dan karyawan |
| BarberRegistration | Pengajuan pendaftaran barber/usaha |
| RegistrationDocument | Dokumen bukti pendaftaran |
| CustomerAddress | Alamat customer dan koordinat |
| ServiceCatalog | Layanan cukur |
| BarberService | Layanan yang dapat dikerjakan barber |
| BarberSchedule | Jadwal kerja barber |
| BarberTimeOff | Jadwal libur/blokir waktu barber |
| PricingRule | Aturan biaya jarak |
| Booking | Data utama pemesanan |
| BookingDetail | Detail layanan pada booking |
| Payment | Data pembayaran |
| Review | Rating dan ulasan |
| Notification | Notifikasi dalam aplikasi |
| BookingStatusHistory | Riwayat perubahan status booking |

---

## 11. Non-Functional Requirements

## 11.1 Security

1. Sistem menggunakan Spring Security.
2. Password menggunakan BCrypt.
3. Akses halaman dibatasi dengan role.
4. Upload file dibatasi berdasarkan tipe dan ukuran.
5. User tidak boleh melihat data milik user lain tanpa hak akses.
6. Owner hanya boleh mengelola barbershop miliknya.
7. Barber hanya boleh mengelola jadwal dan booking miliknya.
8. Customer hanya boleh melihat booking miliknya.

## 11.2 Performance

1. Halaman utama harus dapat dimuat dalam waktu wajar untuk demo lokal.
2. Grid Vaadin harus menggunakan pagination/lazy loading jika data banyak.
3. Query booking harus memiliki index pada barber, waktu, dan status.
4. Perhitungan jarak dilakukan di backend.

## 11.3 Reliability

1. Pembuatan booking harus menggunakan transaksi database.
2. Validasi jadwal harus dilakukan ulang saat booking disimpan.
3. Booking tidak boleh tersimpan sebagian.
4. Error harus ditampilkan dalam pesan yang jelas pada UI.

## 11.4 Usability

1. UI harus sederhana dan mudah dipahami.
2. Form tidak boleh terlalu panjang tanpa pembagian section.
3. Status booking harus terlihat jelas.
4. Admin harus mudah melihat pendaftaran yang menunggu approval.
5. Customer harus mudah melihat total harga sebelum booking dikonfirmasi.

## 11.5 Maintainability

1. Project menggunakan struktur package berbasis domain.
2. Logic bisnis tidak boleh ditaruh langsung di Vaadin View.
3. View hanya memanggil service.
4. Database migration menggunakan Flyway.
5. Entity, repository, service, dan view dipisahkan dengan jelas.

---

## 12. Struktur Package yang Disarankan

```text
com.dicukur.app
├── config
├── security
├── common
│   ├── exception
│   ├── util
│   └── validation
├── user
├── barber
├── barbershop
├── registration
├── servicecatalog
├── schedule
├── booking
├── payment
├── review
├── notification
├── report
└── views
    ├── layout
    ├── auth
    ├── admin
    ├── owner
    ├── barber
    ├── customer
    └── components
```

---

## 13. Technology Decisions

| Area | Keputusan |
|---|---|
| UI | Vaadin Flow server-side |
| Backend | Spring Boot |
| ORM | Spring Data JPA / Hibernate |
| Database | MariaDB |
| DB Migration | Flyway |
| Security | Spring Security |
| Styling | Vaadin Lumo theme + CSS sederhana |
| Payment MVP | Cash/manual transfer |
| Distance Calculation | Haversine formula |
| File Upload | Simpan file di folder server, simpan path di database |
| OAuth | Ditunda |
| Payment Gateway | Ditunda |
| Live Tracking | Ditunda |

---

## 14. MVP Page List

### 14.1 Auth

1. Login Page
2. Logout Action
3. Access Denied Page

### 14.2 Admin

1. Admin Dashboard
2. User Management
3. Service Management
4. Registration Approval
5. Document Review
6. Booking Monitoring
7. Payment Verification
8. Report Page

### 14.3 Owner

1. Owner Dashboard
2. Barbershop Profile
3. Staff Management
4. Booking List
5. Barbershop Report

### 14.4 Barber

1. Barber Dashboard
2. Barber Profile
3. Service Setup
4. Schedule Management
5. Incoming Booking
6. Booking Detail
7. Work History

### 14.5 Customer

1. Customer Dashboard
2. Address Management
3. Service List
4. Barber Selection
5. Booking Form
6. Booking Detail
7. Payment Page
8. Review Form

---

## 15. Milestone Pengerjaan

## Milestone 1 — Foundation

Target:

1. Project bisa run.
2. MariaDB Docker terkoneksi.
3. Flyway migration berhasil.
4. Role dan admin user berhasil di-seed.
5. Entity dasar dan repository dasar tersedia.

## Milestone 2 — Auth dan Dashboard

Target:

1. Login jalan.
2. Redirect role jalan.
3. Dashboard Admin, Owner, Barber, dan Customer tersedia.
4. Route protection berjalan.

## Milestone 3 — Master Data

Target:

1. Admin CRUD layanan.
2. Customer CRUD alamat.
3. Barber CRUD jadwal.
4. Pricing rule dapat dipakai untuk hitung harga.

## Milestone 4 — Registration dan Approval

Target:

1. Form pendaftaran Owner (saat register).
2. Form pendaftaran barbershop (setelah login sebagai Owner).
3. Upload dokumen barbershop.
4. Admin approve/reject pendaftaran barbershop.
5. Owner dapat menambahkan karyawan barber setelah barbershop approved.

## Milestone 5 — Booking Core

Target:

1. Customer membuat booking.
2. Sistem cek jadwal.
3. Sistem hitung jarak.
4. Sistem hitung total harga.
5. Barber menerima/menolak booking.
6. Barber update status booking.

## Milestone 6 — Payment, Review, Report

Target:

1. Payment cash/manual transfer.
2. Review setelah completed.
3. Notifikasi sederhana.
4. Laporan sederhana.
5. Demo flow selesai.

---

## 16. Demo Scenario

Skenario demo utama:

```text
Admin login
↓
Admin melihat pendaftaran barber/usaha
↓
Admin approve pendaftaran
↓
Owner login
↓
Owner mengelola barbershop dan menambahkan karyawan
↓
Barber login
↓
Barber mengatur jadwal
↓
Customer login
↓
Customer menambahkan alamat
↓
Customer memilih layanan dan barber
↓
Sistem menghitung jarak dan harga
↓
Customer membuat booking
↓
Barber menerima booking
↓
Barber update status sampai completed
↓
Customer membayar dan memberi rating
↓
Admin/Owner melihat laporan
```

---

## 17. Acceptance Criteria Global

Project MVP dianggap berhasil jika:

1. Aplikasi dapat dijalankan melalui Spring Boot.
2. Database dibuat melalui Flyway.
3. Login dan role-based access berjalan.
4. Admin dapat melakukan approval pendaftaran.
5. Owner dapat mengelola barbershop dan staff.
6. Barber dapat mengatur jadwal dan memproses booking.
7. Customer dapat membuat booking.
8. Sistem dapat menghitung harga berdasarkan layanan dan jarak.
9. Payment sederhana dapat dicatat.
10. Customer dapat memberi rating setelah booking selesai.
11. Laporan sederhana dapat ditampilkan.
12. Demo flow dapat dijalankan tanpa error besar.

---

## 18. Risiko dan Mitigasi

| Risiko | Dampak | Mitigasi |
|---|---|---|
| Scope terlalu besar | Demo tidak selesai | Fokus MVP, tunda OAuth, payment gateway, tracking, dan chat |
| Error dependency Java/Vaadin | Build gagal di laptop anggota | Samakan JDK dan versi Maven semua anggota |
| Database migration gagal | Aplikasi tidak bisa start | Gunakan Flyway dan jangan edit migration lama setelah dijalankan |
| Logic booking terlalu kompleks | Fitur inti terlambat | Mulai dari booking sederhana dengan satu layanan dan satu barber |
| Double booking | Data jadwal bentrok | Validasi overlap di backend sebelum simpan booking |
| Upload dokumen error | Approval tidak bisa demo | Simpan file lokal dan path di database dulu |
| UI terlalu lama dibuat | Fitur backend tidak selesai | Gunakan komponen Vaadin standar seperti Grid, FormLayout, Button, Dialog |

---

## 19. Open Questions

1. Apakah customer boleh memilih barber langsung atau sistem yang menentukan barber?
2. Apakah owner bisa menjadi barber juga?
3. Apakah satu booking boleh memiliki lebih dari satu layanan?
4. Apakah biaya jarak dihitung dari lokasi barber atau lokasi barbershop?
5. Apakah transfer manual wajib upload bukti?
6. Apakah admin bisa mengganti barber pada booking yang sudah dibuat?
7. Apakah barber karyawan boleh mengubah harga sendiri atau hanya owner yang boleh?
8. Apakah barbershop boleh memiliki lebih dari satu alamat/cabang?

Untuk MVP, keputusan sementara:

1. Customer boleh memilih barber langsung.
2. Owner dapat memiliki barbershop, tetapi tidak wajib menjadi barber.
3. Satu booking boleh memiliki satu atau lebih layanan, tetapi demo bisa mulai dari satu layanan.
4. Biaya jarak dihitung dari lokasi asal barber atau barbershop sesuai data booking.
5. Transfer manual boleh upload bukti, cash tidak perlu.
6. Admin boleh membantu mengganti booking secara manual pada versi lanjutan.
7. Harga layanan dikelola admin/owner, bukan barber karyawan.
8. Multi-cabang ditunda.

---

## 20. Prioritas Implementasi Terdekat

Urutan kerja setelah dokumen ini:

1. Seed roles final: Admin, Owner, Barber, Customer.
2. Seed admin user.
3. Security login.
4. Dashboard role.
5. Admin CRUD layanan.
6. Customer CRUD alamat.
7. Register Owner → Login → Form pendaftaran barbershop → Upload dokumen.
8. Admin approve/reject barbershop.
9. Owner tambah karyawan barber.
10. Booking core.
