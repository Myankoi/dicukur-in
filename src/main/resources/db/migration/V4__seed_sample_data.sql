-- =========================================================
-- V4: SEED SAMPLE DATA
-- Password for ALL seeded users: password
-- BCrypt hash: $2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe
-- =========================================================

-- =========================================================
-- 1. USERS (Owner, Barber, Customer)
-- =========================================================
-- Role IDs: 1=Admin, 2=Owner, 3=Barber, 4=Customer

-- Owners
INSERT IGNORE INTO `users` (`id`, `role_id`, `name`, `email`, `phone`, `password`, `status`) VALUES
(2, 2, 'Budi Santoso', 'budi@dicukur.com', '081222222222', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active'),
(3, 2, 'Siti Rahayu', 'siti@dicukur.com', '081333333333', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active');

-- Barbers
INSERT IGNORE INTO `users` (`id`, `role_id`, `name`, `email`, `phone`, `password`, `status`) VALUES
(4, 3, 'Andi Prasetyo', 'andi@dicukur.com', '081444444444', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active'),
(5, 3, 'Rudi Hermawan', 'rudi@dicukur.com', '081555555555', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active'),
(6, 3, 'Dika Firmansyah', 'dika@dicukur.com', '081666666666', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active'),
(7, 3, 'Fajar Nugroho', 'fajar@dicukur.com', '081777777777', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active');

-- Customers
INSERT IGNORE INTO `users` (`id`, `role_id`, `name`, `email`, `phone`, `password`, `status`) VALUES
(8, 4, 'Ahmad Rizki', 'ahmad@gmail.com', '081888888888', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active'),
(9, 4, 'Bayu Setiawan', 'bayu@gmail.com', '081999999999', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active'),
(10, 4, 'Cahya Dewi', 'cahya@gmail.com', '082000000000', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active');

-- =========================================================
-- 2. BARBER REGISTRATIONS (approved ones)
-- =========================================================
INSERT IGNORE INTO `barber_registrations` (`id`, `applicant_id`, `registration_type`, `business_name`, `description`, `address`, `district`, `city`, `province`, `postal_code`, `latitude`, `longitude`, `service_radius_km`, `status`, `submitted_at`, `reviewed_by`, `reviewed_at`, `admin_notes`) VALUES
(1, 2, 'business', 'King Barbershop', 'Barbershop premium dengan pelayanan terbaik di Jakarta Selatan', 'Jl. Kemang Raya No. 15', 'Kemang', 'Jakarta Selatan', 'DKI Jakarta', '12730', -6.26150000, 106.81350000, 15.00, 'approved', '2026-01-15 10:00:00', 1, '2026-01-16 09:00:00', 'Dokumen lengkap dan valid'),
(2, 3, 'business', 'Style Station', 'Studio cukur modern dengan konsep industrial', 'Jl. Sudirman No. 88', 'Setiabudi', 'Jakarta Selatan', 'DKI Jakarta', '12920', -6.22590000, 106.80310000, 12.00, 'approved', '2026-02-01 11:00:00', 1, '2026-02-02 10:00:00', 'Disetujui - lisensi lengkap'),
(3, 4, 'independent', NULL, 'Barber freelance berpengalaman 5 tahun', 'Jl. Mangga Dua No. 10', 'Sawah Besar', 'Jakarta Pusat', 'DKI Jakarta', '10730', -6.14730000, 106.83250000, 10.00, 'approved', '2026-02-10 14:00:00', 1, '2026-02-11 09:00:00', 'Portofolio bagus');

-- =========================================================
-- 3. REGISTRATION REVIEW HISTORY
-- =========================================================
INSERT IGNORE INTO `registration_review_history` (`id`, `registration_id`, `reviewed_by`, `old_status`, `new_status`, `notes`) VALUES
(1, 1, 1, 'submitted', 'under_review', 'Mulai review dokumen'),
(2, 1, 1, 'under_review', 'approved', 'Semua dokumen valid, disetujui'),
(3, 2, 1, 'submitted', 'approved', 'Fast-track approval - dokumen lengkap'),
(4, 3, 1, 'submitted', 'approved', 'Portofolio memenuhi standar');

-- =========================================================
-- 4. BARBERSHOPS
-- =========================================================
INSERT IGNORE INTO `barbershops` (`id`, `owner_id`, `registration_id`, `name`, `description`, `business_phone`, `business_email`, `business_license_number`, `business_address`, `district`, `city`, `province`, `postal_code`, `latitude`, `longitude`, `service_radius_km`, `verification_status`, `status`, `approved_by`, `approved_at`, `rating_average`, `total_completed`) VALUES
(1, 2, 1, 'King Barbershop', 'Barbershop premium di Kemang dengan pelayanan terbaik. Suasana nyaman, barber berpengalaman, dan hasil selalu rapi.', '021-7654321', 'king@barbershop.com', 'SIUP-001-JKS', 'Jl. Kemang Raya No. 15, Kemang', 'Kemang', 'Jakarta Selatan', 'DKI Jakarta', '12730', -6.26150000, 106.81350000, 15.00, 'approved', 'active', 1, '2026-01-16 09:00:00', 4.60, 25),
(2, 3, 2, 'Style Station', 'Studio cukur modern dengan konsep industrial. Spesialis fade cut dan modern hairstyle untuk pria urban.', '021-1234567', 'style@station.com', 'SIUP-002-JKS', 'Jl. Sudirman No. 88, Setiabudi', 'Setiabudi', 'Jakarta Selatan', 'DKI Jakarta', '12920', -6.22590000, 106.80310000, 12.00, 'approved', 'active', 1, '2026-02-02 10:00:00', 4.80, 18);

-- =========================================================
-- 5. BARBER PROFILES
-- =========================================================
INSERT IGNORE INTO `barber_profiles` (`id`, `user_id`, `barber_type`, `barbershop_id`, `registration_id`, `bio`, `experience_years`, `base_address`, `base_latitude`, `base_longitude`, `service_radius_km`, `verification_status`, `availability_status`, `approved_by`, `approved_at`, `rating_average`, `total_completed`) VALUES
(1, 4, 'employee', 1, NULL, 'Spesialis fade cut dan pompadour. Berpengalaman 5 tahun di barbershop premium.', 5, 'Jl. Kemang Raya No. 15, Kemang', -6.26150000, 106.81350000, 15.00, 'verified', 'available', 1, '2026-01-20 09:00:00', 4.70, 15),
(2, 5, 'employee', 1, NULL, 'Ahli cukur jenggot dan klasik cut. Ramah dan teliti dalam bekerja.', 3, 'Jl. Kemang Raya No. 15, Kemang', -6.26150000, 106.81350000, 15.00, 'verified', 'available', 1, '2026-01-20 09:00:00', 4.50, 10),
(3, 6, 'employee', 2, NULL, 'Barber muda berbakat dengan keahlian modern hairstyle dan coloring.', 2, 'Jl. Sudirman No. 88, Setiabudi', -6.22590000, 106.80310000, 12.00, 'verified', 'available', 1, '2026-02-05 09:00:00', 4.80, 8),
(4, 7, 'independent', NULL, 3, 'Barber panggilan berpengalaman. Fleksibel waktu dan tempat. Spesialis semua jenis potongan pria.', 7, 'Jl. Mangga Dua No. 10, Jakarta Pusat', -6.14730000, 106.83250000, 10.00, 'verified', 'available', 1, '2026-02-11 09:00:00', 4.90, 30);

-- =========================================================
-- 6. BARBERSHOP STAFF
-- =========================================================
INSERT IGNORE INTO `barbershop_staff` (`id`, `barbershop_id`, `barber_id`, `added_by`, `position`, `employment_status`, `joined_at`) VALUES
(1, 1, 4, 2, 'Senior Barber', 'active', '2026-01-20 09:00:00'),
(2, 1, 5, 2, 'Barber', 'active', '2026-01-20 09:00:00'),
(3, 2, 6, 3, 'Barber', 'active', '2026-02-05 09:00:00');

-- =========================================================
-- 7. BARBERSHOP SERVICES
-- =========================================================
INSERT IGNORE INTO `barbershop_services` (`id`, `barbershop_id`, `service_id`, `business_price`, `business_duration`, `status`) VALUES
-- King Barbershop services
(1, 1, 1, 60000.00, 45, 'active'),
(2, 1, 2, 50000.00, 40, 'active'),
(3, 1, 3, 35000.00, 25, 'active'),
(4, 1, 4, 85000.00, 70, 'active'),
-- Style Station services
(5, 2, 1, 70000.00, 50, 'active'),
(6, 2, 3, 40000.00, 30, 'active'),
(7, 2, 4, 100000.00, 75, 'active');

-- =========================================================
-- 8. BARBER SERVICES (for independent barber)
-- =========================================================
INSERT IGNORE INTO `barber_services` (`id`, `barber_id`, `service_id`, `custom_price`, `custom_duration`, `status`) VALUES
(1, 7, 1, 55000.00, 40, 'active'),
(2, 7, 2, 45000.00, 35, 'active'),
(3, 7, 3, 30000.00, 20, 'active'),
(4, 7, 4, 80000.00, 60, 'active');

-- =========================================================
-- 9. BARBER SCHEDULES (Senin-Sabtu)
-- =========================================================
-- day_of_week: 1=Senin, 2=Selasa, ... 6=Sabtu, 7=Minggu

-- Andi (barber_id=4) - Senin sampai Sabtu
INSERT IGNORE INTO `barber_schedules` (`id`, `barber_id`, `day_of_week`, `start_time`, `end_time`, `status`) VALUES
(1, 4, 1, '09:00:00', '18:00:00', 'active'),
(2, 4, 2, '09:00:00', '18:00:00', 'active'),
(3, 4, 3, '09:00:00', '18:00:00', 'active'),
(4, 4, 4, '09:00:00', '18:00:00', 'active'),
(5, 4, 5, '09:00:00', '18:00:00', 'active'),
(6, 4, 6, '09:00:00', '15:00:00', 'active');

-- Rudi (barber_id=5) - Senin sampai Jumat
INSERT IGNORE INTO `barber_schedules` (`id`, `barber_id`, `day_of_week`, `start_time`, `end_time`, `status`) VALUES
(7, 5, 1, '10:00:00', '19:00:00', 'active'),
(8, 5, 2, '10:00:00', '19:00:00', 'active'),
(9, 5, 3, '10:00:00', '19:00:00', 'active'),
(10, 5, 4, '10:00:00', '19:00:00', 'active'),
(11, 5, 5, '10:00:00', '19:00:00', 'active');

-- Dika (barber_id=6) - Selasa sampai Minggu
INSERT IGNORE INTO `barber_schedules` (`id`, `barber_id`, `day_of_week`, `start_time`, `end_time`, `status`) VALUES
(12, 6, 2, '08:00:00', '17:00:00', 'active'),
(13, 6, 3, '08:00:00', '17:00:00', 'active'),
(14, 6, 4, '08:00:00', '17:00:00', 'active'),
(15, 6, 5, '08:00:00', '17:00:00', 'active'),
(16, 6, 6, '08:00:00', '17:00:00', 'active'),
(17, 6, 7, '08:00:00', '14:00:00', 'active');

-- Fajar (barber_id=7, independent) - Setiap hari
INSERT IGNORE INTO `barber_schedules` (`id`, `barber_id`, `day_of_week`, `start_time`, `end_time`, `status`) VALUES
(18, 7, 1, '08:00:00', '20:00:00', 'active'),
(19, 7, 2, '08:00:00', '20:00:00', 'active'),
(20, 7, 3, '08:00:00', '20:00:00', 'active'),
(21, 7, 4, '08:00:00', '20:00:00', 'active'),
(22, 7, 5, '08:00:00', '20:00:00', 'active'),
(23, 7, 6, '08:00:00', '20:00:00', 'active'),
(24, 7, 7, '10:00:00', '16:00:00', 'active');

-- =========================================================
-- 10. CUSTOMER ADDRESSES
-- =========================================================
INSERT IGNORE INTO `customer_addresses` (`id`, `customer_id`, `label`, `recipient_name`, `phone`, `full_address`, `district`, `city`, `province`, `postal_code`, `latitude`, `longitude`, `notes`, `is_default`) VALUES
(1, 8, 'Rumah', 'Ahmad Rizki', '081888888888', 'Jl. Pejaten Barat No. 22, RT 05/RW 03', 'Pasar Minggu', 'Jakarta Selatan', 'DKI Jakarta', '12510', -6.27550000, 106.83710000, 'Rumah pagar hijau, sebelah minimarket', TRUE),
(2, 8, 'Kantor', 'Ahmad Rizki', '081888888888', 'Gedung Wisma GKBI Lt. 12, Jl. Sudirman', 'Tanah Abang', 'Jakarta Pusat', 'DKI Jakarta', '10220', -6.19560000, 106.82150000, 'Lobby lantai dasar', FALSE),
(3, 9, 'Rumah', 'Bayu Setiawan', '081999999999', 'Apartemen Taman Rasuna Tower 9 Unit 12A', 'Setiabudi', 'Jakarta Selatan', 'DKI Jakarta', '12960', -6.23160000, 106.83630000, 'Apartemen tower 9, Unit 12A', TRUE),
(4, 10, 'Rumah', 'Cahya Dewi', '082000000000', 'Jl. Panglima Polim V No. 10', 'Kebayoran Baru', 'Jakarta Selatan', 'DKI Jakarta', '12160', -6.24370000, 106.79810000, 'Rumah cat putih, ada pohon mangga depan', TRUE);

-- =========================================================
-- 11. BOOKINGS (mix of statuses)
-- =========================================================

-- Booking 1: Completed - Ahmad di King Barbershop dengan Andi
INSERT IGNORE INTO `bookings` (`id`, `booking_code`, `customer_id`, `barber_id`, `barbershop_id`, `customer_address_id`, `pricing_rule_id`, `start_datetime`, `end_datetime`, `address_snapshot`, `customer_latitude`, `customer_longitude`, `barber_base_snapshot`, `barber_latitude`, `barber_longitude`, `distance_km`, `free_radius_km`, `price_per_km`, `travel_fee`, `service_subtotal`, `total_price`, `status`, `payment_status`, `notes`) VALUES
(1, 'BK-20260301-0001', 8, 4, 1, 1, 1, '2026-03-01 10:00:00', '2026-03-01 10:45:00', 'Jl. Pejaten Barat No. 22', -6.27550000, 106.83710000, 'Jl. Kemang Raya No. 15', -6.26150000, 106.81350000, 3.10, 2.00, 5000.00, 5500.00, 60000.00, 65500.00, 'completed', 'paid', 'Minta fade cut medium');

-- Booking 2: Completed - Bayu di Style Station dengan Dika
INSERT IGNORE INTO `bookings` (`id`, `booking_code`, `customer_id`, `barber_id`, `barbershop_id`, `customer_address_id`, `pricing_rule_id`, `start_datetime`, `end_datetime`, `address_snapshot`, `customer_latitude`, `customer_longitude`, `barber_base_snapshot`, `barber_latitude`, `barber_longitude`, `distance_km`, `free_radius_km`, `price_per_km`, `travel_fee`, `service_subtotal`, `total_price`, `status`, `payment_status`, `notes`) VALUES
(2, 'BK-20260305-0001', 9, 6, 2, 3, 1, '2026-03-05 14:00:00', '2026-03-05 15:15:00', 'Apartemen Taman Rasuna Tower 9', -6.23160000, 106.83630000, 'Jl. Sudirman No. 88', -6.22590000, 106.80310000, 3.70, 2.00, 5000.00, 8500.00, 100000.00, 108500.00, 'completed', 'paid', 'Paket rambut dan jenggot');

-- Booking 3: Completed - Cahya dengan Fajar (independent)
INSERT IGNORE INTO `bookings` (`id`, `booking_code`, `customer_id`, `barber_id`, `barbershop_id`, `customer_address_id`, `pricing_rule_id`, `start_datetime`, `end_datetime`, `address_snapshot`, `customer_latitude`, `customer_longitude`, `barber_base_snapshot`, `barber_latitude`, `barber_longitude`, `distance_km`, `free_radius_km`, `price_per_km`, `travel_fee`, `service_subtotal`, `total_price`, `status`, `payment_status`, `notes`) VALUES
(3, 'BK-20260310-0001', 10, 7, NULL, 4, 1, '2026-03-10 09:00:00', '2026-03-10 09:40:00', 'Jl. Panglima Polim V No. 10', -6.24370000, 106.79810000, 'Jl. Mangga Dua No. 10', -6.14730000, 106.83250000, 11.20, 2.00, 5000.00, 46000.00, 55000.00, 101000.00, 'completed', 'paid', 'Potong rambut anak laki-laki');

-- Booking 4: Completed - Ahmad paket di King Barbershop dengan Rudi
INSERT IGNORE INTO `bookings` (`id`, `booking_code`, `customer_id`, `barber_id`, `barbershop_id`, `customer_address_id`, `pricing_rule_id`, `start_datetime`, `end_datetime`, `address_snapshot`, `customer_latitude`, `customer_longitude`, `barber_base_snapshot`, `barber_latitude`, `barber_longitude`, `distance_km`, `free_radius_km`, `price_per_km`, `travel_fee`, `service_subtotal`, `total_price`, `status`, `payment_status`, `notes`) VALUES
(4, 'BK-20260315-0001', 8, 5, 1, 1, 1, '2026-03-15 13:00:00', '2026-03-15 14:10:00', 'Jl. Pejaten Barat No. 22', -6.27550000, 106.83710000, 'Jl. Kemang Raya No. 15', -6.26150000, 106.81350000, 3.10, 2.00, 5000.00, 5500.00, 85000.00, 90500.00, 'completed', 'paid', 'Potong rambut + cukur jenggot');

-- Booking 5: Completed - Bayu di King Barbershop dengan Andi
INSERT IGNORE INTO `bookings` (`id`, `booking_code`, `customer_id`, `barber_id`, `barbershop_id`, `customer_address_id`, `pricing_rule_id`, `start_datetime`, `end_datetime`, `address_snapshot`, `customer_latitude`, `customer_longitude`, `barber_base_snapshot`, `barber_latitude`, `barber_longitude`, `distance_km`, `free_radius_km`, `price_per_km`, `travel_fee`, `service_subtotal`, `total_price`, `status`, `payment_status`, `notes`) VALUES
(5, 'BK-20260320-0001', 9, 4, 1, 3, 1, '2026-03-20 10:00:00', '2026-03-20 10:45:00', 'Apartemen Taman Rasuna Tower 9', -6.23160000, 106.83630000, 'Jl. Kemang Raya No. 15', -6.26150000, 106.81350000, 3.90, 2.00, 5000.00, 9500.00, 60000.00, 69500.00, 'completed', 'paid', 'Potong rambut biasa');

-- Booking 6: In Progress - Ahmad dengan Andi
INSERT IGNORE INTO `bookings` (`id`, `booking_code`, `customer_id`, `barber_id`, `barbershop_id`, `customer_address_id`, `pricing_rule_id`, `start_datetime`, `end_datetime`, `address_snapshot`, `customer_latitude`, `customer_longitude`, `barber_base_snapshot`, `barber_latitude`, `barber_longitude`, `distance_km`, `free_radius_km`, `price_per_km`, `travel_fee`, `service_subtotal`, `total_price`, `status`, `payment_status`, `notes`) VALUES
(6, 'BK-20260801-0001', 8, 4, 1, 1, 1, '2026-08-06 10:00:00', '2026-08-06 10:45:00', 'Jl. Pejaten Barat No. 22', -6.27550000, 106.83710000, 'Jl. Kemang Raya No. 15', -6.26150000, 106.81350000, 3.10, 2.00, 5000.00, 5500.00, 60000.00, 65500.00, 'in_progress', 'unpaid', 'Cukur reguler');

-- Booking 7: Accepted (upcoming) - Cahya dengan Dika
INSERT IGNORE INTO `bookings` (`id`, `booking_code`, `customer_id`, `barber_id`, `barbershop_id`, `customer_address_id`, `pricing_rule_id`, `start_datetime`, `end_datetime`, `address_snapshot`, `customer_latitude`, `customer_longitude`, `barber_base_snapshot`, `barber_latitude`, `barber_longitude`, `distance_km`, `free_radius_km`, `price_per_km`, `travel_fee`, `service_subtotal`, `total_price`, `status`, `payment_status`, `notes`) VALUES
(7, 'BK-20260807-0001', 10, 6, 2, 4, 1, '2026-08-07 14:00:00', '2026-08-07 14:50:00', 'Jl. Panglima Polim V No. 10', -6.24370000, 106.79810000, 'Jl. Sudirman No. 88', -6.22590000, 106.80310000, 2.10, 2.00, 5000.00, 500.00, 70000.00, 70500.00, 'accepted', 'unpaid', 'Potong rambut model Korea');

-- Booking 8: Pending - Bayu dengan Fajar
INSERT IGNORE INTO `bookings` (`id`, `booking_code`, `customer_id`, `barber_id`, `barbershop_id`, `customer_address_id`, `pricing_rule_id`, `start_datetime`, `end_datetime`, `address_snapshot`, `customer_latitude`, `customer_longitude`, `barber_base_snapshot`, `barber_latitude`, `barber_longitude`, `distance_km`, `free_radius_km`, `price_per_km`, `travel_fee`, `service_subtotal`, `total_price`, `status`, `payment_status`, `notes`) VALUES
(8, 'BK-20260808-0001', 9, 7, NULL, 3, 1, '2026-08-08 16:00:00', '2026-08-08 17:00:00', 'Apartemen Taman Rasuna Tower 9', -6.23160000, 106.83630000, 'Jl. Mangga Dua No. 10', -6.14730000, 106.83250000, 9.40, 2.00, 5000.00, 37000.00, 80000.00, 117000.00, 'pending', 'unpaid', 'Paket lengkap rambut + jenggot');

-- Booking 9: Cancelled by customer
INSERT IGNORE INTO `bookings` (`id`, `booking_code`, `customer_id`, `barber_id`, `barbershop_id`, `customer_address_id`, `pricing_rule_id`, `start_datetime`, `end_datetime`, `address_snapshot`, `customer_latitude`, `customer_longitude`, `barber_base_snapshot`, `barber_latitude`, `barber_longitude`, `distance_km`, `free_radius_km`, `price_per_km`, `travel_fee`, `service_subtotal`, `total_price`, `status`, `payment_status`, `notes`, `cancellation_reason`) VALUES
(9, 'BK-20260225-0001', 8, 6, 2, 2, 1, '2026-02-25 15:00:00', '2026-02-25 15:50:00', 'Gedung Wisma GKBI Lt. 12', -6.19560000, 106.82150000, 'Jl. Sudirman No. 88', -6.22590000, 106.80310000, 3.80, 2.00, 5000.00, 9000.00, 70000.00, 79000.00, 'cancelled_by_customer', 'unpaid', NULL, 'Ada meeting mendadak di kantor');

-- Booking 10: Completed - repeat customer Ahmad
INSERT IGNORE INTO `bookings` (`id`, `booking_code`, `customer_id`, `barber_id`, `barbershop_id`, `customer_address_id`, `pricing_rule_id`, `start_datetime`, `end_datetime`, `address_snapshot`, `customer_latitude`, `customer_longitude`, `barber_base_snapshot`, `barber_latitude`, `barber_longitude`, `distance_km`, `free_radius_km`, `price_per_km`, `travel_fee`, `service_subtotal`, `total_price`, `status`, `payment_status`, `notes`) VALUES
(10, 'BK-20260401-0001', 8, 7, NULL, 1, 1, '2026-04-01 09:00:00', '2026-04-01 09:35:00', 'Jl. Pejaten Barat No. 22', -6.27550000, 106.83710000, 'Jl. Mangga Dua No. 10', -6.14730000, 106.83250000, 14.30, 2.00, 5000.00, 61500.00, 45000.00, 106500.00, 'completed', 'paid', 'Potong rambut anak');

-- =========================================================
-- 12. BOOKING DETAILS (services per booking)
-- =========================================================
-- Booking 1: Potong Rambut Pria (King Barbershop price)
INSERT IGNORE INTO `booking_details` (`id`, `booking_id`, `service_id`, `service_name`, `price`, `duration`, `subtotal`) VALUES
(1, 1, 1, 'Potong Rambut Pria', 60000.00, 45, 60000.00);

-- Booking 2: Paket Rambut + Jenggot (Style Station price)
INSERT IGNORE INTO `booking_details` (`id`, `booking_id`, `service_id`, `service_name`, `price`, `duration`, `subtotal`) VALUES
(2, 2, 4, 'Paket Rambut + Jenggot', 100000.00, 75, 100000.00);

-- Booking 3: Potong Rambut Pria (Fajar independent price)
INSERT IGNORE INTO `booking_details` (`id`, `booking_id`, `service_id`, `service_name`, `price`, `duration`, `subtotal`) VALUES
(3, 3, 1, 'Potong Rambut Pria', 55000.00, 40, 55000.00);

-- Booking 4: Paket Rambut + Jenggot (King Barbershop price)
INSERT IGNORE INTO `booking_details` (`id`, `booking_id`, `service_id`, `service_name`, `price`, `duration`, `subtotal`) VALUES
(4, 4, 4, 'Paket Rambut + Jenggot', 85000.00, 70, 85000.00);

-- Booking 5: Potong Rambut Pria (King Barbershop price)
INSERT IGNORE INTO `booking_details` (`id`, `booking_id`, `service_id`, `service_name`, `price`, `duration`, `subtotal`) VALUES
(5, 5, 1, 'Potong Rambut Pria', 60000.00, 45, 60000.00);

-- Booking 6: Potong Rambut Pria (King Barbershop price)
INSERT IGNORE INTO `booking_details` (`id`, `booking_id`, `service_id`, `service_name`, `price`, `duration`, `subtotal`) VALUES
(6, 6, 1, 'Potong Rambut Pria', 60000.00, 45, 60000.00);

-- Booking 7: Potong Rambut Pria (Style Station price)
INSERT IGNORE INTO `booking_details` (`id`, `booking_id`, `service_id`, `service_name`, `price`, `duration`, `subtotal`) VALUES
(7, 7, 1, 'Potong Rambut Pria', 70000.00, 50, 70000.00);

-- Booking 8: Paket Rambut + Jenggot (Fajar independent price)
INSERT IGNORE INTO `booking_details` (`id`, `booking_id`, `service_id`, `service_name`, `price`, `duration`, `subtotal`) VALUES
(8, 8, 4, 'Paket Rambut + Jenggot', 80000.00, 60, 80000.00);

-- Booking 9: Potong Rambut Pria (Style Station price)
INSERT IGNORE INTO `booking_details` (`id`, `booking_id`, `service_id`, `service_name`, `price`, `duration`, `subtotal`) VALUES
(9, 9, 1, 'Potong Rambut Pria', 70000.00, 50, 70000.00);

-- Booking 10: Potong Rambut Anak (Fajar independent price)
INSERT IGNORE INTO `booking_details` (`id`, `booking_id`, `service_id`, `service_name`, `price`, `duration`, `subtotal`) VALUES
(10, 10, 2, 'Potong Rambut Anak', 45000.00, 35, 45000.00);

-- =========================================================
-- 13. PAYMENTS (for completed bookings)
-- =========================================================
INSERT IGNORE INTO `payments` (`id`, `booking_id`, `payment_method`, `amount`, `status`, `paid_at`, `verified_at`) VALUES
(1, 1, 'cash', 65500.00, 'paid', '2026-03-01 10:50:00', '2026-03-01 10:50:00'),
(2, 2, 'transfer', 108500.00, 'paid', '2026-03-05 15:20:00', '2026-03-05 15:30:00'),
(3, 3, 'qris', 101000.00, 'paid', '2026-03-10 09:45:00', '2026-03-10 09:45:00'),
(4, 4, 'cash', 90500.00, 'paid', '2026-03-15 14:15:00', '2026-03-15 14:15:00'),
(5, 5, 'transfer', 69500.00, 'paid', '2026-03-20 10:50:00', '2026-03-20 11:00:00'),
(6, 10, 'qris', 106500.00, 'paid', '2026-04-01 09:40:00', '2026-04-01 09:40:00');

-- =========================================================
-- 14. REVIEWS (for completed bookings)
-- =========================================================
INSERT IGNORE INTO `reviews` (`id`, `booking_id`, `customer_id`, `barber_id`, `barbershop_id`, `rating`, `review`, `is_visible`) VALUES
(1, 1, 8, 4, 1, 5, 'Hasil potongan rapi banget, barbernya ramah dan profesional. Pasti balik lagi!', TRUE),
(2, 2, 9, 6, 2, 5, 'Fade cut-nya keren abis! Suasana barbershop juga enak, ada kopi gratis.', TRUE),
(3, 3, 10, 7, NULL, 5, 'Barber panggilan paling recommended! Datang tepat waktu, hasilnya memuaskan.', TRUE),
(4, 4, 8, 5, 1, 4, 'Cukur jenggotnya rapi, tapi agak lama nunggunya. Overall oke lah.', TRUE),
(5, 5, 9, 4, 1, 4, 'Potongannya bagus, cuma waktu datang telat 10 menit. Selain itu top!', TRUE),
(6, 10, 8, 7, NULL, 5, 'Fajar selalu konsisten bagus! Anak saya yang biasanya rewel bisa anteng dicukur sama dia.', TRUE);

-- =========================================================
-- 15. BOOKING STATUS HISTORY
-- =========================================================
-- Booking 1 history
INSERT IGNORE INTO `booking_status_history` (`id`, `booking_id`, `old_status`, `new_status`, `changed_by`, `notes`) VALUES
(1, 1, NULL, 'pending', 8, 'Booking dibuat'),
(2, 1, 'pending', 'accepted', 4, 'Booking diterima'),
(3, 1, 'accepted', 'on_the_way', 4, 'Barber sedang menuju lokasi'),
(4, 1, 'on_the_way', 'arrived', 4, 'Barber sudah sampai'),
(5, 1, 'arrived', 'in_progress', 4, 'Mulai cukur'),
(6, 1, 'in_progress', 'completed', 4, 'Selesai');

-- Booking 2 history
INSERT IGNORE INTO `booking_status_history` (`id`, `booking_id`, `old_status`, `new_status`, `changed_by`, `notes`) VALUES
(7, 2, NULL, 'pending', 9, 'Booking dibuat'),
(8, 2, 'pending', 'accepted', 6, 'Booking diterima'),
(9, 2, 'accepted', 'on_the_way', 6, 'Menuju lokasi'),
(10, 2, 'on_the_way', 'arrived', 6, 'Sampai di lokasi'),
(11, 2, 'arrived', 'in_progress', 6, 'Mulai cukur'),
(12, 2, 'in_progress', 'completed', 6, 'Selesai');

-- Booking 6 (in_progress) history
INSERT IGNORE INTO `booking_status_history` (`id`, `booking_id`, `old_status`, `new_status`, `changed_by`, `notes`) VALUES
(13, 6, NULL, 'pending', 8, 'Booking dibuat'),
(14, 6, 'pending', 'accepted', 4, 'Booking diterima'),
(15, 6, 'accepted', 'on_the_way', 4, 'Menuju lokasi customer'),
(16, 6, 'on_the_way', 'arrived', 4, 'Sampai di lokasi'),
(17, 6, 'arrived', 'in_progress', 4, 'Sedang mengerjakan');

-- Booking 9 (cancelled) history
INSERT IGNORE INTO `booking_status_history` (`id`, `booking_id`, `old_status`, `new_status`, `changed_by`, `notes`) VALUES
(18, 9, NULL, 'pending', 8, 'Booking dibuat'),
(19, 9, 'pending', 'accepted', 6, 'Booking diterima'),
(20, 9, 'accepted', 'cancelled_by_customer', 8, 'Ada meeting mendadak');

-- =========================================================
-- 16. NOTIFICATIONS (sample)
-- =========================================================
INSERT IGNORE INTO `notifications` (`id`, `user_id`, `booking_id`, `registration_id`, `title`, `message`, `type`, `is_read`) VALUES
(1, 8, 1, NULL, 'Booking Diterima', 'Booking BK-20260301-0001 telah diterima oleh Andi Prasetyo.', 'booking_accepted', TRUE),
(2, 8, 1, NULL, 'Barber Sedang Menuju Lokasi', 'Andi Prasetyo sedang menuju lokasi Anda.', 'barber_on_the_way', TRUE),
(3, 8, 1, NULL, 'Booking Selesai', 'Booking BK-20260301-0001 telah selesai. Terima kasih!', 'booking_completed', TRUE),
(4, 4, 6, NULL, 'Booking Baru', 'Anda mendapat booking baru BK-20260801-0001 dari Ahmad Rizki.', 'new_booking', FALSE),
(5, 10, 7, NULL, 'Booking Diterima', 'Booking BK-20260807-0001 telah diterima oleh Dika Firmansyah.', 'booking_accepted', FALSE),
(6, 9, 8, NULL, 'Menunggu Konfirmasi', 'Booking BK-20260808-0001 sedang menunggu konfirmasi dari Fajar Nugroho.', 'booking_pending', FALSE),
(7, 2, NULL, 1, 'Pendaftaran Disetujui', 'Pendaftaran barbershop King Barbershop telah disetujui.', 'registration_approved', TRUE),
(8, 3, NULL, 2, 'Pendaftaran Disetujui', 'Pendaftaran barbershop Style Station telah disetujui.', 'registration_approved', TRUE);

-- =========================================================
-- 17. ADDITIONAL SERVICES (more variety)
-- =========================================================
INSERT IGNORE INTO `services` (`id`, `name`, `description`, `price`, `duration`, `status`) VALUES
(5, 'Hair Coloring', 'Pewarnaan rambut profesional dengan produk berkualitas', 150000.00, 90, 'active'),
(6, 'Hair Wash & Massage', 'Cuci rambut dengan pijat kepala relaksasi', 35000.00, 20, 'active'),
(7, 'Facial Treatment Pria', 'Perawatan wajah khusus pria: cleansing, masker, moisturizer', 85000.00, 45, 'active'),
(8, 'Cukur Kumis', 'Rapikan dan bentuk kumis sesuai keinginan', 20000.00, 15, 'active');
