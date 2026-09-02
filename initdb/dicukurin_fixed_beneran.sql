
-- Database: barber_booking
-- Target: Laragon / MariaDB / MySQL


SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
SET time_zone = "+00:00";
SET FOREIGN_KEY_CHECKS = 0;

CREATE DATABASE IF NOT EXISTS `barber_booking`
  DEFAULT CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE `barber_booking`;

-- =========================================================
-- DROP VIEWS
-- =========================================================
DROP VIEW IF EXISTS `vw_pending_verifications`;
DROP VIEW IF EXISTS `vw_registration_report`;
DROP VIEW IF EXISTS `vw_booking_report`;
DROP VIEW IF EXISTS `vw_barber_performance`;
DROP VIEW IF EXISTS `vw_barbershop_performance`;

-- =========================================================
-- DROP TABLES
-- =========================================================
DROP TABLE IF EXISTS `notifications`;
DROP TABLE IF EXISTS `booking_status_history`;
DROP TABLE IF EXISTS `reviews`;
DROP TABLE IF EXISTS `payments`;
DROP TABLE IF EXISTS `booking_details`;
DROP TABLE IF EXISTS `bookings`;
DROP TABLE IF EXISTS `barber_time_offs`;
DROP TABLE IF EXISTS `barber_schedules`;
DROP TABLE IF EXISTS `barbershop_staff`;
DROP TABLE IF EXISTS `barber_services`;
DROP TABLE IF EXISTS `barbershop_services`;
DROP TABLE IF EXISTS `pricing_rules`;
DROP TABLE IF EXISTS `services`;
DROP TABLE IF EXISTS `customer_addresses`;
DROP TABLE IF EXISTS `barber_profiles`;
DROP TABLE IF EXISTS `barbershops`;
DROP TABLE IF EXISTS `registration_review_history`;
DROP TABLE IF EXISTS `registration_documents`;
DROP TABLE IF EXISTS `barber_registrations`;
DROP TABLE IF EXISTS `users`;
DROP TABLE IF EXISTS `roles`;

SET FOREIGN_KEY_CHECKS = 1;

-- =========================================================
-- 1. ROLES
-- =========================================================
CREATE TABLE `roles` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_roles_name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `roles` (`id`, `name`) VALUES
(1, 'Admin'),
(2, 'Owner'),
(3, 'Barber'),
(4, 'Customer');

-- =========================================================
-- 2. USERS
-- Semua akun disimpan di sini.
-- Role:
-- Admin    = pengelola sistem
-- Barber   = barber mandiri atau karyawan barber
-- Customer = pemesan jasa
-- Owner    = pemilik usaha/barbershop
-- =========================================================
CREATE TABLE `users` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `role_id` BIGINT NOT NULL,
  `name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(100) NOT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `password` VARCHAR(255) NOT NULL,
  `photo` VARCHAR(255) DEFAULT NULL,
  `status` ENUM('active','inactive','suspended') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_users_email` (`email`),
  UNIQUE KEY `uk_users_phone` (`phone`),
  KEY `idx_users_role_id` (`role_id`),
  KEY `idx_users_status` (`status`),

  CONSTRAINT `fk_users_role`
    FOREIGN KEY (`role_id`) REFERENCES `roles` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 3. BARBER REGISTRATIONS
-- Menyimpan proses pendaftaran barber mandiri atau usaha.
-- registration_type:
-- independent = barber perorangan
-- business    = usaha/barbershop
-- =========================================================
CREATE TABLE `barber_registrations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `applicant_id` BIGINT NOT NULL,

  `registration_type` ENUM('independent','business') NOT NULL,

  -- Data untuk barber mandiri
  `personal_experience_years` INT DEFAULT NULL,
  `personal_skill_description` TEXT DEFAULT NULL,

  -- Data untuk usaha/barbershop
  `business_name` VARCHAR(150) DEFAULT NULL,
  `business_license_number` VARCHAR(100) DEFAULT NULL,

  -- Data umum lokasi
  `description` TEXT DEFAULT NULL,
  `address` TEXT DEFAULT NULL,
  `district` VARCHAR(100) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `province` VARCHAR(100) DEFAULT NULL,
  `postal_code` VARCHAR(20) DEFAULT NULL,
  `latitude` DECIMAL(10,8) DEFAULT NULL,
  `longitude` DECIMAL(11,8) DEFAULT NULL,
  `service_radius_km` DECIMAL(6,2) NOT NULL DEFAULT 10.00,

  `status` ENUM('draft','submitted','under_review','approved','rejected') NOT NULL DEFAULT 'draft',
  `submitted_at` DATETIME DEFAULT NULL,
  `reviewed_by` BIGINT DEFAULT NULL,
  `reviewed_at` DATETIME DEFAULT NULL,
  `admin_notes` TEXT DEFAULT NULL,
  `rejection_reason` TEXT DEFAULT NULL,

  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_registrations_applicant` (`applicant_id`),
  KEY `idx_registrations_status` (`status`),
  KEY `idx_registrations_type` (`registration_type`),
  KEY `idx_registrations_reviewed_by` (`reviewed_by`),

  CONSTRAINT `fk_registrations_applicant`
    FOREIGN KEY (`applicant_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT `fk_registrations_reviewed_by`
    FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT `chk_registrations_experience`
    CHECK (`personal_experience_years` IS NULL OR `personal_experience_years` >= 0),

  CONSTRAINT `chk_registrations_radius`
    CHECK (`service_radius_km` >= 0),

  CONSTRAINT `chk_registrations_latitude`
    CHECK (`latitude` IS NULL OR (`latitude` BETWEEN -90 AND 90)),

  CONSTRAINT `chk_registrations_longitude`
    CHECK (`longitude` IS NULL OR (`longitude` BETWEEN -180 AND 180))
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 4. REGISTRATION DOCUMENTS
-- Menyimpan bukti pendaftaran.
-- File fisik disimpan di folder server, database hanya menyimpan path.
-- Untuk independent:
-- - identity_card
-- - competency_certificate
-- - portfolio
-- Untuk business:
-- - identity_card
-- - business_license
-- - shop_photo
-- =========================================================
CREATE TABLE `registration_documents` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `registration_id` BIGINT NOT NULL,

  `document_type` ENUM(
    'identity_card',
    'business_license',
    'competency_certificate',
    'portfolio',
    'shop_photo',
    'other'
  ) NOT NULL,

  `file_name` VARCHAR(255) NOT NULL,
  `file_path` VARCHAR(255) NOT NULL,
  `mime_type` VARCHAR(100) DEFAULT NULL,
  `file_size` BIGINT DEFAULT NULL,

  `verification_status` ENUM('pending','valid','invalid') NOT NULL DEFAULT 'pending',
  `admin_notes` TEXT DEFAULT NULL,

  `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_documents_registration` (`registration_id`),
  KEY `idx_documents_type` (`document_type`),
  KEY `idx_documents_status` (`verification_status`),

  CONSTRAINT `fk_documents_registration`
    FOREIGN KEY (`registration_id`) REFERENCES `barber_registrations` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT `chk_documents_file_size`
    CHECK (`file_size` IS NULL OR `file_size` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 5. REGISTRATION REVIEW HISTORY
-- Riwayat proses review admin.
-- =========================================================
CREATE TABLE `registration_review_history` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `registration_id` BIGINT NOT NULL,
  `reviewed_by` BIGINT NOT NULL,
  `old_status` VARCHAR(50) DEFAULT NULL,
  `new_status` VARCHAR(50) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_review_history_registration` (`registration_id`),
  KEY `idx_review_history_reviewer` (`reviewed_by`),

  CONSTRAINT `fk_review_history_registration`
    FOREIGN KEY (`registration_id`) REFERENCES `barber_registrations` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT `fk_review_history_reviewer`
    FOREIGN KEY (`reviewed_by`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 6. BARBERSHOPS
-- Menyimpan data usaha/barbershop.
-- Satu owner dapat memiliki satu atau lebih barbershop.
-- =========================================================
CREATE TABLE `barbershops` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `owner_id` BIGINT NOT NULL,
  `registration_id` BIGINT DEFAULT NULL,

  `name` VARCHAR(150) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `business_phone` VARCHAR(20) DEFAULT NULL,
  `business_email` VARCHAR(100) DEFAULT NULL,
  `business_license_number` VARCHAR(100) DEFAULT NULL,

  `business_address` TEXT NOT NULL,
  `district` VARCHAR(100) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `province` VARCHAR(100) DEFAULT NULL,
  `postal_code` VARCHAR(20) DEFAULT NULL,
  `latitude` DECIMAL(10,8) NOT NULL,
  `longitude` DECIMAL(11,8) NOT NULL,
  `service_radius_km` DECIMAL(6,2) NOT NULL DEFAULT 10.00,

  `verification_status` ENUM('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `status` ENUM('active','inactive','suspended') NOT NULL DEFAULT 'inactive',
  `approved_by` BIGINT DEFAULT NULL,
  `approved_at` DATETIME DEFAULT NULL,
  `rejection_reason` TEXT DEFAULT NULL,

  `rating_average` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  `total_completed` INT NOT NULL DEFAULT 0,

  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_barbershops_owner` (`owner_id`),
  KEY `idx_barbershops_registration` (`registration_id`),
  KEY `idx_barbershops_status` (`status`),
  KEY `idx_barbershops_verification` (`verification_status`),
  KEY `idx_barbershops_location` (`latitude`, `longitude`),

  CONSTRAINT `fk_barbershops_owner`
    FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT `fk_barbershops_registration`
    FOREIGN KEY (`registration_id`) REFERENCES `barber_registrations` (`id`)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT `fk_barbershops_approved_by`
    FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT `chk_barbershops_rating`
    CHECK (`rating_average` BETWEEN 0 AND 5),

  CONSTRAINT `chk_barbershops_radius`
    CHECK (`service_radius_km` >= 0),

  CONSTRAINT `chk_barbershops_latitude`
    CHECK (`latitude` BETWEEN -90 AND 90),

  CONSTRAINT `chk_barbershops_longitude`
    CHECK (`longitude` BETWEEN -180 AND 180)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 7. BARBER PROFILES
-- Menyimpan data khusus barber.
-- barber_type:
-- independent = barber mandiri
-- employee    = karyawan dari barbershop
-- owner       = owner yang juga ikut melayani cukur
-- =========================================================
CREATE TABLE `barber_profiles` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `barber_type` ENUM('independent','employee','owner') NOT NULL DEFAULT 'independent',
  `barbershop_id` BIGINT DEFAULT NULL,
  `registration_id` BIGINT DEFAULT NULL,

  `bio` TEXT DEFAULT NULL,
  `experience_years` INT NOT NULL DEFAULT 0,

  -- Lokasi asal barber. Untuk employee bisa mengikuti lokasi barbershop,
  -- tetapi tetap disimpan agar perhitungan jarak bisa fleksibel.
  `base_address` TEXT DEFAULT NULL,
  `base_latitude` DECIMAL(10,8) NOT NULL,
  `base_longitude` DECIMAL(11,8) NOT NULL,
  `service_radius_km` DECIMAL(6,2) NOT NULL DEFAULT 10.00,

  `verification_status` ENUM('pending','verified','rejected') NOT NULL DEFAULT 'pending',
  `availability_status` ENUM('available','unavailable','busy') NOT NULL DEFAULT 'available',

  `approved_by` BIGINT DEFAULT NULL,
  `approved_at` DATETIME DEFAULT NULL,
  `rejection_reason` TEXT DEFAULT NULL,

  `rating_average` DECIMAL(3,2) NOT NULL DEFAULT 0.00,
  `total_completed` INT NOT NULL DEFAULT 0,

  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_barber_profiles_user_id` (`user_id`),
  KEY `idx_barber_profiles_barbershop` (`barbershop_id`),
  KEY `idx_barber_profiles_registration` (`registration_id`),
  KEY `idx_barber_profiles_verification` (`verification_status`),
  KEY `idx_barber_profiles_availability` (`availability_status`),
  KEY `idx_barber_profiles_location` (`base_latitude`, `base_longitude`),
  KEY `idx_barber_profiles_approved_by` (`approved_by`),

  CONSTRAINT `fk_barber_profiles_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT `fk_barber_profiles_barbershop`
    FOREIGN KEY (`barbershop_id`) REFERENCES `barbershops` (`id`)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT `fk_barber_profiles_registration`
    FOREIGN KEY (`registration_id`) REFERENCES `barber_registrations` (`id`)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT `fk_barber_profiles_approved_by`
    FOREIGN KEY (`approved_by`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT `chk_barber_profiles_experience`
    CHECK (`experience_years` >= 0),

  CONSTRAINT `chk_barber_profiles_rating`
    CHECK (`rating_average` BETWEEN 0 AND 5),

  CONSTRAINT `chk_barber_profiles_radius`
    CHECK (`service_radius_km` >= 0),

  CONSTRAINT `chk_barber_profiles_latitude`
    CHECK (`base_latitude` BETWEEN -90 AND 90),

  CONSTRAINT `chk_barber_profiles_longitude`
    CHECK (`base_longitude` BETWEEN -180 AND 180)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 8. CUSTOMER ADDRESSES
-- Alamat pelanggan wajib punya koordinat untuk hitung jarak.
-- =========================================================
CREATE TABLE `customer_addresses` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `customer_id` BIGINT NOT NULL,
  `label` VARCHAR(50) DEFAULT NULL,
  `recipient_name` VARCHAR(100) DEFAULT NULL,
  `phone` VARCHAR(20) DEFAULT NULL,
  `full_address` TEXT NOT NULL,
  `district` VARCHAR(100) DEFAULT NULL,
  `city` VARCHAR(100) DEFAULT NULL,
  `province` VARCHAR(100) DEFAULT NULL,
  `postal_code` VARCHAR(20) DEFAULT NULL,
  `latitude` DECIMAL(10,8) NOT NULL,
  `longitude` DECIMAL(11,8) NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `is_default` BOOLEAN NOT NULL DEFAULT FALSE,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_customer_addresses_customer_id` (`customer_id`),
  KEY `idx_customer_addresses_location` (`latitude`, `longitude`),

  CONSTRAINT `fk_customer_addresses_customer`
    FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT `chk_customer_addresses_latitude`
    CHECK (`latitude` BETWEEN -90 AND 90),

  CONSTRAINT `chk_customer_addresses_longitude`
    CHECK (`longitude` BETWEEN -180 AND 180)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 9. SERVICES
-- Harga dasar layanan.
-- =========================================================
CREATE TABLE `services` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `description` TEXT DEFAULT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `duration` INT NOT NULL COMMENT 'Durasi dalam menit',
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_services_status` (`status`),

  CONSTRAINT `chk_services_price`
    CHECK (`price` >= 0),

  CONSTRAINT `chk_services_duration`
    CHECK (`duration` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `services` (`name`, `description`, `price`, `duration`, `status`) VALUES
('Potong Rambut Pria', 'Layanan potong rambut pria standar', 50000.00, 45, 'active'),
('Potong Rambut Anak', 'Layanan potong rambut untuk anak', 45000.00, 40, 'active'),
('Cukur Jenggot', 'Layanan cukur dan rapikan jenggot', 30000.00, 25, 'active'),
('Paket Rambut + Jenggot', 'Potong rambut pria dan cukur jenggot', 75000.00, 70, 'active');

-- =========================================================
-- 10. PRICING RULES
-- Aturan biaya jarak. Bisa diubah dari admin.
-- Formula:
-- travel_fee = CEIL(GREATEST(0, distance_km - free_radius_km)) * price_per_km
-- total_price = service_subtotal + travel_fee
-- =========================================================
CREATE TABLE `pricing_rules` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(100) NOT NULL,
  `free_radius_km` DECIMAL(6,2) NOT NULL DEFAULT 2.00,
  `price_per_km` DECIMAL(12,2) NOT NULL DEFAULT 5000.00,
  `minimum_travel_fee` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `maximum_travel_fee` DECIMAL(12,2) DEFAULT NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_pricing_rules_status` (`status`),

  CONSTRAINT `chk_pricing_free_radius`
    CHECK (`free_radius_km` >= 0),

  CONSTRAINT `chk_pricing_price_per_km`
    CHECK (`price_per_km` >= 0),

  CONSTRAINT `chk_pricing_min_fee`
    CHECK (`minimum_travel_fee` >= 0),

  CONSTRAINT `chk_pricing_max_fee`
    CHECK (`maximum_travel_fee` IS NULL OR `maximum_travel_fee` >= `minimum_travel_fee`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO `pricing_rules`
(`id`, `name`, `free_radius_km`, `price_per_km`, `minimum_travel_fee`, `maximum_travel_fee`, `status`)
VALUES
(1, 'Harga Jarak Default', 2.00, 5000.00, 0.00, NULL, 'active');

-- =========================================================
-- 11. BARBERSHOP SERVICES
-- Layanan yang disediakan oleh usaha/barbershop.
-- Jika business_price NULL, gunakan harga dari services.
-- =========================================================
CREATE TABLE `barbershop_services` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `barbershop_id` BIGINT NOT NULL,
  `service_id` BIGINT NOT NULL,
  `business_price` DECIMAL(12,2) DEFAULT NULL,
  `business_duration` INT DEFAULT NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_barbershop_services_shop_service` (`barbershop_id`, `service_id`),
  KEY `idx_barbershop_services_service_id` (`service_id`),
  KEY `idx_barbershop_services_status` (`status`),

  CONSTRAINT `fk_barbershop_services_shop`
    FOREIGN KEY (`barbershop_id`) REFERENCES `barbershops` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT `fk_barbershop_services_service`
    FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT `chk_barbershop_services_price`
    CHECK (`business_price` IS NULL OR `business_price` >= 0),

  CONSTRAINT `chk_barbershop_services_duration`
    CHECK (`business_duration` IS NULL OR `business_duration` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 12. BARBER SERVICES
-- Layanan yang bisa dilakukan oleh barber.
-- Untuk employee, layanan dapat mengacu pada layanan milik barbershop.
-- =========================================================
CREATE TABLE `barber_services` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `barber_id` BIGINT NOT NULL,
  `service_id` BIGINT NOT NULL,
  `custom_price` DECIMAL(12,2) DEFAULT NULL,
  `custom_duration` INT DEFAULT NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_barber_services_barber_service` (`barber_id`, `service_id`),
  KEY `idx_barber_services_service_id` (`service_id`),
  KEY `idx_barber_services_status` (`status`),

  CONSTRAINT `fk_barber_services_barber`
    FOREIGN KEY (`barber_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT `fk_barber_services_service`
    FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT `chk_barber_services_custom_price`
    CHECK (`custom_price` IS NULL OR `custom_price` >= 0),

  CONSTRAINT `chk_barber_services_custom_duration`
    CHECK (`custom_duration` IS NULL OR `custom_duration` > 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 13. BARBERSHOP STAFF
-- Menghubungkan barbershop dengan karyawan barber.
-- =========================================================
CREATE TABLE `barbershop_staff` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `barbershop_id` BIGINT NOT NULL,
  `barber_id` BIGINT NOT NULL,
  `added_by` BIGINT DEFAULT NULL,

  `position` VARCHAR(100) DEFAULT 'Barber',
  `employment_status` ENUM('pending','active','inactive','removed') NOT NULL DEFAULT 'active',
  `joined_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `removed_at` DATETIME DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,

  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_barbershop_staff_shop_barber` (`barbershop_id`, `barber_id`),
  KEY `idx_staff_barber` (`barber_id`),
  KEY `idx_staff_added_by` (`added_by`),
  KEY `idx_staff_status` (`employment_status`),

  CONSTRAINT `fk_staff_barbershop`
    FOREIGN KEY (`barbershop_id`) REFERENCES `barbershops` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT `fk_staff_barber`
    FOREIGN KEY (`barber_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT `fk_staff_added_by`
    FOREIGN KEY (`added_by`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 14. BARBER SCHEDULES
-- Jadwal kerja rutin barber.
-- day_of_week: 1=Senin, 2=Selasa, ..., 7=Minggu
-- Booking aktual tetap dihitung dari bookings.start_datetime dan bookings.end_datetime.
-- =========================================================
CREATE TABLE `barber_schedules` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `barber_id` BIGINT NOT NULL,
  `day_of_week` TINYINT NOT NULL,
  `start_time` TIME NOT NULL,
  `end_time` TIME NOT NULL,
  `status` ENUM('active','inactive') NOT NULL DEFAULT 'active',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_barber_schedules_barber_day` (`barber_id`, `day_of_week`),
  KEY `idx_barber_schedules_status` (`status`),

  CONSTRAINT `fk_barber_schedules_barber`
    FOREIGN KEY (`barber_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT `chk_barber_schedules_day`
    CHECK (`day_of_week` BETWEEN 1 AND 7),

  CONSTRAINT `chk_barber_schedules_time`
    CHECK (`end_time` > `start_time`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 15. BARBER TIME OFFS
-- Jadwal libur atau blokir waktu barber.
-- =========================================================
CREATE TABLE `barber_time_offs` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `barber_id` BIGINT NOT NULL,
  `start_datetime` DATETIME NOT NULL,
  `end_datetime` DATETIME NOT NULL,
  `reason` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_barber_time_offs_barber_time` (`barber_id`, `start_datetime`, `end_datetime`),

  CONSTRAINT `fk_barber_time_offs_barber`
    FOREIGN KEY (`barber_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT `chk_barber_time_offs_time`
    CHECK (`end_datetime` > `start_datetime`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 16. BOOKINGS
-- Data utama transaksi pemesanan.
-- Field koordinat dan harga jarak disimpan sebagai snapshot transaksi.
-- =========================================================
CREATE TABLE `bookings` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `booking_code` VARCHAR(30) NOT NULL,

  `customer_id` BIGINT NOT NULL,
  `barber_id` BIGINT NOT NULL,
  `barbershop_id` BIGINT DEFAULT NULL,
  `customer_address_id` BIGINT DEFAULT NULL,
  `pricing_rule_id` BIGINT DEFAULT NULL,

  `start_datetime` DATETIME NOT NULL,
  `end_datetime` DATETIME NOT NULL,

  -- Snapshot lokasi pelanggan saat booking dibuat
  `address_snapshot` TEXT NOT NULL,
  `customer_latitude` DECIMAL(10,8) NOT NULL,
  `customer_longitude` DECIMAL(11,8) NOT NULL,

  -- Snapshot lokasi asal barber/barbershop saat booking dibuat
  `barber_base_snapshot` TEXT DEFAULT NULL,
  `barber_latitude` DECIMAL(10,8) NOT NULL,
  `barber_longitude` DECIMAL(11,8) NOT NULL,

  -- Snapshot harga saat booking dibuat
  `distance_km` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `free_radius_km` DECIMAL(6,2) NOT NULL DEFAULT 2.00,
  `price_per_km` DECIMAL(12,2) NOT NULL DEFAULT 5000.00,
  `travel_fee` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `service_subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,

  `status` ENUM(
    'pending',
    'accepted',
    'rejected',
    'on_the_way',
    'arrived',
    'in_progress',
    'completed',
    'cancelled_by_customer',
    'cancelled_by_barber',
    'cancelled_by_admin',
    'no_show'
  ) NOT NULL DEFAULT 'pending',

  `payment_status` ENUM('unpaid','waiting_verification','paid','failed','refunded') NOT NULL DEFAULT 'unpaid',
  `notes` TEXT DEFAULT NULL,
  `cancellation_reason` TEXT DEFAULT NULL,

  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_bookings_booking_code` (`booking_code`),
  KEY `idx_bookings_customer` (`customer_id`),
  KEY `idx_bookings_barber_time` (`barber_id`, `start_datetime`, `end_datetime`),
  KEY `idx_bookings_barbershop` (`barbershop_id`),
  KEY `idx_bookings_status` (`status`),
  KEY `idx_bookings_payment_status` (`payment_status`),
  KEY `idx_bookings_address` (`customer_address_id`),
  KEY `idx_bookings_pricing_rule` (`pricing_rule_id`),

  CONSTRAINT `fk_bookings_customer`
    FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT `fk_bookings_barber`
    FOREIGN KEY (`barber_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT `fk_bookings_barbershop`
    FOREIGN KEY (`barbershop_id`) REFERENCES `barbershops` (`id`)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT `fk_bookings_customer_address`
    FOREIGN KEY (`customer_address_id`) REFERENCES `customer_addresses` (`id`)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT `fk_bookings_pricing_rule`
    FOREIGN KEY (`pricing_rule_id`) REFERENCES `pricing_rules` (`id`)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT `chk_bookings_time`
    CHECK (`end_datetime` > `start_datetime`),

  CONSTRAINT `chk_bookings_customer_latitude`
    CHECK (`customer_latitude` BETWEEN -90 AND 90),

  CONSTRAINT `chk_bookings_customer_longitude`
    CHECK (`customer_longitude` BETWEEN -180 AND 180),

  CONSTRAINT `chk_bookings_barber_latitude`
    CHECK (`barber_latitude` BETWEEN -90 AND 90),

  CONSTRAINT `chk_bookings_barber_longitude`
    CHECK (`barber_longitude` BETWEEN -180 AND 180),

  CONSTRAINT `chk_bookings_distance`
    CHECK (`distance_km` >= 0),

  CONSTRAINT `chk_bookings_fee`
    CHECK (`travel_fee` >= 0),

  CONSTRAINT `chk_bookings_service_subtotal`
    CHECK (`service_subtotal` >= 0),

  CONSTRAINT `chk_bookings_total_price`
    CHECK (`total_price` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 17. BOOKING DETAILS
-- Snapshot layanan saat transaksi.
-- =========================================================
CREATE TABLE `booking_details` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `booking_id` BIGINT NOT NULL,
  `service_id` BIGINT NOT NULL,
  `service_name` VARCHAR(100) NOT NULL,
  `price` DECIMAL(12,2) NOT NULL,
  `duration` INT NOT NULL COMMENT 'Durasi dalam menit',
  `subtotal` DECIMAL(12,2) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_booking_details_booking_id` (`booking_id`),
  KEY `idx_booking_details_service_id` (`service_id`),

  CONSTRAINT `fk_booking_details_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT `fk_booking_details_service`
    FOREIGN KEY (`service_id`) REFERENCES `services` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT `chk_booking_details_price`
    CHECK (`price` >= 0),

  CONSTRAINT `chk_booking_details_duration`
    CHECK (`duration` > 0),

  CONSTRAINT `chk_booking_details_subtotal`
    CHECK (`subtotal` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 18. PAYMENTS
-- Untuk MVP: satu booking satu payment.
-- =========================================================
CREATE TABLE `payments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `booking_id` BIGINT NOT NULL,

  -- Untuk payment gateway atau pembayaran manual
  `gateway_transaction_id` VARCHAR(100) DEFAULT NULL,
  `payment_method` ENUM('cash','transfer','qris') NOT NULL,
  `payment_type` VARCHAR(50) DEFAULT NULL,
  `amount` DECIMAL(12,2) NOT NULL,

  `status` ENUM('pending','waiting_verification','paid','failed','cancelled') NOT NULL DEFAULT 'pending',
  `paid_at` DATETIME DEFAULT NULL,
  `verified_at` DATETIME DEFAULT NULL,
  `proof` VARCHAR(255) DEFAULT NULL,
  `snap_token` VARCHAR(255) DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,

  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_payments_booking_id` (`booking_id`),
  KEY `idx_payments_status` (`status`),
  KEY `idx_payments_gateway_transaction_id` (`gateway_transaction_id`),

  CONSTRAINT `fk_payments_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT `chk_payments_amount`
    CHECK (`amount` >= 0)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 19. REVIEWS
-- Satu booking hanya boleh punya satu review.
-- =========================================================
CREATE TABLE `reviews` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `booking_id` BIGINT NOT NULL,
  `customer_id` BIGINT NOT NULL,
  `barber_id` BIGINT NOT NULL,
  `barbershop_id` BIGINT DEFAULT NULL,

  `rating` TINYINT NOT NULL,
  `review` TEXT DEFAULT NULL,
  `is_visible` BOOLEAN NOT NULL DEFAULT TRUE,

  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_reviews_booking_id` (`booking_id`),
  KEY `idx_reviews_customer_id` (`customer_id`),
  KEY `idx_reviews_barber_id` (`barber_id`),
  KEY `idx_reviews_barbershop_id` (`barbershop_id`),
  KEY `idx_reviews_rating` (`rating`),

  CONSTRAINT `fk_reviews_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT `fk_reviews_customer`
    FOREIGN KEY (`customer_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT `fk_reviews_barber`
    FOREIGN KEY (`barber_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT,

  CONSTRAINT `fk_reviews_barbershop`
    FOREIGN KEY (`barbershop_id`) REFERENCES `barbershops` (`id`)
    ON UPDATE CASCADE
    ON DELETE SET NULL,

  CONSTRAINT `chk_reviews_rating`
    CHECK (`rating` BETWEEN 1 AND 5)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 20. BOOKING STATUS HISTORY
-- Riwayat perubahan status booking.
-- =========================================================
CREATE TABLE `booking_status_history` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `booking_id` BIGINT NOT NULL,
  `old_status` VARCHAR(50) DEFAULT NULL,
  `new_status` VARCHAR(50) NOT NULL,
  `changed_by` BIGINT NOT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_booking_status_history_booking` (`booking_id`),
  KEY `idx_booking_status_history_changed_by` (`changed_by`),

  CONSTRAINT `fk_booking_status_history_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT `fk_booking_status_history_user`
    FOREIGN KEY (`changed_by`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 21. NOTIFICATIONS
-- Notifikasi dalam aplikasi.
-- =========================================================
CREATE TABLE `notifications` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `booking_id` BIGINT DEFAULT NULL,
  `registration_id` BIGINT DEFAULT NULL,

  `title` VARCHAR(150) NOT NULL,
  `message` TEXT NOT NULL,
  `type` VARCHAR(50) DEFAULT NULL,
  `is_read` BOOLEAN NOT NULL DEFAULT FALSE,

  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_notifications_user_read` (`user_id`, `is_read`),
  KEY `idx_notifications_booking_id` (`booking_id`),
  KEY `idx_notifications_registration_id` (`registration_id`),

  CONSTRAINT `fk_notifications_user`
    FOREIGN KEY (`user_id`) REFERENCES `users` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT `fk_notifications_booking`
    FOREIGN KEY (`booking_id`) REFERENCES `bookings` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE,

  CONSTRAINT `fk_notifications_registration`
    FOREIGN KEY (`registration_id`) REFERENCES `barber_registrations` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 22. DATA OPERASIONAL SIAP PAKAI
-- Password akun demo owner/barber/customer: password
-- Customer demo sudah memiliki alamat default dan dapat langsung membuat booking.
-- =========================================================

INSERT INTO `users` (`id`, `role_id`, `name`, `email`, `phone`, `password`, `status`) VALUES
(1, 1, 'Admin Dicukur', 'admin@dicukur.com', '081111111111', '$2a$10$akWPrdljucBjodtE0mzBNOFMvURDlx08bT4S4EyRtlPyWVKpfvJqm', 'active'),
(2, 2, 'Budi Santoso', 'budi@dicukur.com', '081222222222', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active'),
(3, 2, 'Siti Rahayu', 'siti@dicukur.com', '081333333333', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active'),
(4, 3, 'Andi Prasetyo', 'andi@dicukur.com', '081444444444', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active'),
(5, 3, 'Rudi Hermawan', 'rudi@dicukur.com', '081555555555', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active'),
(6, 3, 'Dika Firmansyah', 'dika@dicukur.com', '081666666666', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active'),
(7, 3, 'Fajar Nugroho', 'fajar@dicukur.com', '081777777777', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active'),
(8, 4, 'Ahmad Rizki', 'ahmad@gmail.com', '081888888888', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active'),
(9, 4, 'Bayu Setiawan', 'bayu@gmail.com', '081999999999', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active'),
(10, 4, 'Cahya Dewi', 'cahya@gmail.com', '082000000000', '$2a$10$hYPV8WDFINOZGomgttmcA.RKchhvTxiTuIPQVI50HXxP7bh0qSeRe', 'active');

INSERT INTO `barber_registrations`
(`id`, `applicant_id`, `registration_type`, `business_name`, `description`, `address`, `district`, `city`, `province`, `postal_code`, `latitude`, `longitude`, `service_radius_km`, `status`, `submitted_at`, `reviewed_by`, `reviewed_at`, `admin_notes`)
VALUES
(1, 2, 'business', 'King Barbershop', 'Barbershop premium dengan pelayanan terbaik di Jakarta Selatan', 'Jl. Kemang Raya No. 15', 'Kemang', 'Jakarta Selatan', 'DKI Jakarta', '12730', -6.26150000, 106.81350000, 15.00, 'approved', '2026-01-15 10:00:00', 1, '2026-01-16 09:00:00', 'Dokumen lengkap dan valid'),
(2, 3, 'business', 'Style Station', 'Studio cukur modern dengan konsep industrial', 'Jl. Sudirman No. 88', 'Setiabudi', 'Jakarta Selatan', 'DKI Jakarta', '12920', -6.22590000, 106.80310000, 12.00, 'approved', '2026-02-01 11:00:00', 1, '2026-02-02 10:00:00', 'Disetujui - lisensi lengkap');

INSERT INTO `barbershops`
(`id`, `owner_id`, `registration_id`, `name`, `description`, `business_phone`, `business_email`, `business_license_number`, `business_address`, `district`, `city`, `province`, `postal_code`, `latitude`, `longitude`, `service_radius_km`, `verification_status`, `status`, `approved_by`, `approved_at`, `rating_average`, `total_completed`)
VALUES
(1, 2, 1, 'King Barbershop', 'Barbershop premium di Kemang dengan pelayanan terbaik. Suasana nyaman dan barber berpengalaman.', '021-7654321', 'king@barbershop.com', 'SIUP-001-JKS', 'Jl. Kemang Raya No. 15, Kemang', 'Kemang', 'Jakarta Selatan', 'DKI Jakarta', '12730', -6.26150000, 106.81350000, 15.00, 'approved', 'active', 1, '2026-01-16 09:00:00', 4.60, 25),
(2, 3, 2, 'Style Station', 'Studio cukur modern dengan konsep industrial. Spesialis fade cut dan modern hairstyle.', '021-1234567', 'style@station.com', 'SIUP-002-JKS', 'Jl. Sudirman No. 88, Setiabudi', 'Setiabudi', 'Jakarta Selatan', 'DKI Jakarta', '12920', -6.22590000, 106.80310000, 12.00, 'approved', 'active', 1, '2026-02-02 10:00:00', 4.80, 18);

INSERT INTO `barber_profiles`
(`id`, `user_id`, `barber_type`, `barbershop_id`, `registration_id`, `bio`, `experience_years`, `base_address`, `base_latitude`, `base_longitude`, `service_radius_km`, `verification_status`, `availability_status`, `approved_by`, `approved_at`, `rating_average`, `total_completed`)
VALUES
(1, 4, 'employee', 1, NULL, 'Spesialis fade cut dan pompadour.', 5, 'Jl. Kemang Raya No. 15, Kemang', -6.26150000, 106.81350000, 15.00, 'verified', 'available', 1, '2026-01-20 09:00:00', 4.70, 15),
(2, 5, 'employee', 1, NULL, 'Ahli cukur jenggot dan klasik cut.', 3, 'Jl. Kemang Raya No. 15, Kemang', -6.26150000, 106.81350000, 15.00, 'verified', 'available', 1, '2026-01-20 09:00:00', 4.50, 10),
(3, 6, 'employee', 2, NULL, 'Barber dengan keahlian modern hairstyle.', 2, 'Jl. Sudirman No. 88, Setiabudi', -6.22590000, 106.80310000, 12.00, 'verified', 'available', 1, '2026-02-05 09:00:00', 4.80, 8);

INSERT INTO `barbershop_staff` (`id`, `barbershop_id`, `barber_id`, `added_by`, `position`, `employment_status`, `joined_at`) VALUES
(1, 1, 4, 2, 'Senior Barber', 'active', '2026-01-20 09:00:00'),
(2, 1, 5, 2, 'Barber', 'active', '2026-01-20 09:00:00'),
(3, 2, 6, 3, 'Barber', 'active', '2026-02-05 09:00:00');

INSERT INTO `barbershop_services` (`id`, `barbershop_id`, `service_id`, `business_price`, `business_duration`, `status`) VALUES
(1, 1, 1, 60000.00, 45, 'active'),
(2, 1, 2, 50000.00, 40, 'active'),
(3, 1, 3, 35000.00, 25, 'active'),
(4, 1, 4, 85000.00, 70, 'active'),
(5, 2, 1, 70000.00, 50, 'active'),
(6, 2, 3, 40000.00, 30, 'active'),
(7, 2, 4, 100000.00, 75, 'active');

INSERT INTO `barber_schedules` (`id`, `barber_id`, `day_of_week`, `start_time`, `end_time`, `status`) VALUES
(1, 4, 1, '09:00:00', '18:00:00', 'active'), (2, 4, 2, '09:00:00', '18:00:00', 'active'),
(3, 4, 3, '09:00:00', '18:00:00', 'active'), (4, 4, 4, '09:00:00', '18:00:00', 'active'),
(5, 4, 5, '09:00:00', '18:00:00', 'active'), (6, 4, 6, '09:00:00', '15:00:00', 'active'),
(7, 5, 1, '10:00:00', '19:00:00', 'active'), (8, 5, 2, '10:00:00', '19:00:00', 'active'),
(9, 5, 3, '10:00:00', '19:00:00', 'active'), (10, 5, 4, '10:00:00', '19:00:00', 'active'),
(11, 5, 5, '10:00:00', '19:00:00', 'active'), (12, 6, 1, '08:00:00', '17:00:00', 'active'),
(13, 6, 2, '08:00:00', '17:00:00', 'active'), (14, 6, 3, '08:00:00', '17:00:00', 'active'),
(15, 6, 4, '08:00:00', '17:00:00', 'active'), (16, 6, 5, '08:00:00', '17:00:00', 'active'),
(17, 6, 6, '08:00:00', '17:00:00', 'active'), (18, 6, 7, '08:00:00', '14:00:00', 'active');

INSERT INTO `customer_addresses`
(`id`, `customer_id`, `label`, `recipient_name`, `phone`, `full_address`, `district`, `city`, `province`, `postal_code`, `latitude`, `longitude`, `notes`, `is_default`)
VALUES
(1, 8, 'Rumah', 'Ahmad Rizki', '081888888888', 'Jl. Pejaten Barat No. 22, RT 05/RW 03', 'Pasar Minggu', 'Jakarta Selatan', 'DKI Jakarta', '12510', -6.27550000, 106.83710000, 'Rumah pagar hijau, sebelah minimarket', TRUE),
(2, 8, 'Kantor', 'Ahmad Rizki', '081888888888', 'Gedung Wisma GKBI Lt. 12, Jl. Sudirman', 'Tanah Abang', 'Jakarta Pusat', 'DKI Jakarta', '10220', -6.19560000, 106.82150000, 'Lobby lantai dasar', FALSE),
(3, 9, 'Rumah', 'Bayu Setiawan', '081999999999', 'Apartemen Taman Rasuna Tower 9 Unit 12A', 'Setiabudi', 'Jakarta Selatan', 'DKI Jakarta', '12960', -6.23160000, 106.83630000, 'Tower 9, Unit 12A', TRUE),
(4, 10, 'Rumah', 'Cahya Dewi', '082000000000', 'Jl. Panglima Polim V No. 10', 'Kebayoran Baru', 'Jakarta Selatan', 'DKI Jakarta', '12160', -6.24370000, 106.79810000, 'Rumah cat putih', TRUE);

-- =========================================================
-- 23. VIEWS LAPORAN SEDERHANA
-- =========================================================

CREATE OR REPLACE VIEW `vw_pending_verifications` AS
SELECT
  br.id AS registration_id,
  br.registration_type,
  u.name AS applicant_name,
  u.email AS applicant_email,
  u.phone AS applicant_phone,
  br.business_name,
  br.city,
  br.status,
  br.submitted_at,
  COUNT(rd.id) AS total_documents,
  SUM(CASE WHEN rd.verification_status = 'valid' THEN 1 ELSE 0 END) AS valid_documents,
  SUM(CASE WHEN rd.verification_status = 'invalid' THEN 1 ELSE 0 END) AS invalid_documents
FROM barber_registrations br
JOIN users u ON u.id = br.applicant_id
LEFT JOIN registration_documents rd ON rd.registration_id = br.id
WHERE br.status IN ('submitted','under_review')
GROUP BY
  br.id,
  br.registration_type,
  u.name,
  u.email,
  u.phone,
  br.business_name,
  br.city,
  br.status,
  br.submitted_at;

CREATE OR REPLACE VIEW `vw_registration_report` AS
SELECT
  br.id AS registration_id,
  br.registration_type,
  applicant.name AS applicant_name,
  applicant.email AS applicant_email,
  br.business_name,
  br.status,
  reviewer.name AS reviewed_by_name,
  br.submitted_at,
  br.reviewed_at,
  br.rejection_reason,
  br.created_at
FROM barber_registrations br
JOIN users applicant ON applicant.id = br.applicant_id
LEFT JOIN users reviewer ON reviewer.id = br.reviewed_by;

CREATE OR REPLACE VIEW `vw_booking_report` AS
SELECT
  b.id AS booking_id,
  b.booking_code,
  c.name AS customer_name,
  br.name AS barber_name,
  bs.name AS barbershop_name,
  b.start_datetime,
  b.end_datetime,
  b.distance_km,
  b.travel_fee,
  b.service_subtotal,
  b.total_price,
  b.status,
  b.payment_status,
  b.created_at
FROM bookings b
JOIN users c ON c.id = b.customer_id
JOIN users br ON br.id = b.barber_id
LEFT JOIN barbershops bs ON bs.id = b.barbershop_id;

CREATE OR REPLACE VIEW `vw_barber_performance` AS
SELECT
  u.id AS barber_id,
  u.name AS barber_name,
  bp.barber_type,
  bs.name AS barbershop_name,
  COUNT(b.id) AS total_booking,
  SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_booking,
  SUM(CASE WHEN b.status LIKE 'cancelled%' THEN 1 ELSE 0 END) AS cancelled_booking,
  COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_price ELSE 0 END), 0) AS total_revenue,
  COALESCE(AVG(CASE WHEN r.is_visible = TRUE THEN r.rating ELSE NULL END), 0) AS average_rating
FROM users u
JOIN roles ro ON ro.id = u.role_id AND ro.name = 'Barber'
LEFT JOIN barber_profiles bp ON bp.user_id = u.id
LEFT JOIN barbershops bs ON bs.id = bp.barbershop_id
LEFT JOIN bookings b ON b.barber_id = u.id
LEFT JOIN reviews r ON r.booking_id = b.id
GROUP BY
  u.id,
  u.name,
  bp.barber_type,
  bs.name;

CREATE OR REPLACE VIEW `vw_barbershop_performance` AS
SELECT
  bs.id AS barbershop_id,
  bs.name AS barbershop_name,
  owner.name AS owner_name,
  COUNT(DISTINCT st.id) AS total_staff,
  COUNT(b.id) AS total_booking,
  SUM(CASE WHEN b.status = 'completed' THEN 1 ELSE 0 END) AS completed_booking,
  SUM(CASE WHEN b.status LIKE 'cancelled%' THEN 1 ELSE 0 END) AS cancelled_booking,
  COALESCE(SUM(CASE WHEN b.status = 'completed' THEN b.total_price ELSE 0 END), 0) AS total_revenue,
  COALESCE(AVG(CASE WHEN r.is_visible = TRUE THEN r.rating ELSE NULL END), 0) AS average_rating
FROM barbershops bs
JOIN users owner ON owner.id = bs.owner_id
LEFT JOIN barbershop_staff st
  ON st.barbershop_id = bs.id
  AND st.employment_status = 'active'
LEFT JOIN bookings b ON b.barbershop_id = bs.id
LEFT JOIN reviews r ON r.booking_id = b.id
GROUP BY
  bs.id,
  bs.name,
  owner.name;

-- =========================================================
-- CATATAN IMPLEMENTASI BACKEND
-- =========================================================
-- 1. distance_km dihitung di Java dengan rumus Haversine.
-- 2. travel_fee = CEIL(GREATEST(0, distance_km - free_radius_km)) * price_per_km
-- 3. total_price = service_subtotal + travel_fee
--
-- Contoh:
-- service_subtotal = 50000
-- distance_km = 6
-- free_radius_km = 2
-- price_per_km = 5000
-- travel_fee = CEIL(6 - 2) * 5000 = 20000
-- total_price = 70000
--
-- 4. Upload dokumen:
--    - File disimpan di folder server seperti /uploads/verification/
--    - Database menyimpan file_path, file_name, mime_type, dan file_size
--
-- 5. Alur approve:
--    independent:
--      users -> barber_registrations -> registration_documents -> admin approve -> barber_profiles
--
--    business:
--      users(role Owner) -> barber_registrations -> registration_documents -> admin approve -> barbershops
--      owner kemudian menambahkan karyawan ke barbershop_staff
-- =========================================================

COMMIT;
