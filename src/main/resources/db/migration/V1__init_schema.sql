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

-- =========================================================
-- 2. USERS
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
-- =========================================================
CREATE TABLE `barber_registrations` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `applicant_id` BIGINT NOT NULL,
  `registration_type` ENUM('independent','business') NOT NULL,
  `personal_experience_years` INT DEFAULT NULL,
  `personal_skill_description` TEXT DEFAULT NULL,
  `business_name` VARCHAR(150) DEFAULT NULL,
  `business_license_number` VARCHAR(100) DEFAULT NULL,
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
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 4. REGISTRATION DOCUMENTS
-- =========================================================
CREATE TABLE `registration_documents` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `registration_id` BIGINT NOT NULL,
  `document_type` ENUM('identity_card','business_license','competency_certificate','portfolio','shop_photo','other') NOT NULL,
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
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 5. REGISTRATION REVIEW HISTORY
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
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 7. BARBER PROFILES
-- =========================================================
CREATE TABLE `barber_profiles` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT NOT NULL,
  `barber_type` ENUM('independent','employee','owner') NOT NULL DEFAULT 'independent',
  `barbershop_id` BIGINT DEFAULT NULL,
  `registration_id` BIGINT DEFAULT NULL,
  `bio` TEXT DEFAULT NULL,
  `experience_years` INT NOT NULL DEFAULT 0,
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
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 8. CUSTOMER ADDRESSES
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
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 9. SERVICES
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
  KEY `idx_services_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 10. PRICING RULES
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
  KEY `idx_pricing_rules_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 11. BARBERSHOP SERVICES
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
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 12. BARBER SERVICES
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
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 13. BARBERSHOP STAFF
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
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 15. BARBER TIME OFFS
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
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 16. BOOKINGS
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
  `address_snapshot` TEXT NOT NULL,
  `customer_latitude` DECIMAL(10,8) NOT NULL,
  `customer_longitude` DECIMAL(11,8) NOT NULL,
  `barber_base_snapshot` TEXT DEFAULT NULL,
  `barber_latitude` DECIMAL(10,8) NOT NULL,
  `barber_longitude` DECIMAL(11,8) NOT NULL,
  `distance_km` DECIMAL(8,2) NOT NULL DEFAULT 0.00,
  `free_radius_km` DECIMAL(6,2) NOT NULL DEFAULT 2.00,
  `price_per_km` DECIMAL(12,2) NOT NULL DEFAULT 5000.00,
  `travel_fee` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `service_subtotal` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `total_price` DECIMAL(12,2) NOT NULL DEFAULT 0.00,
  `status` ENUM('pending','accepted','rejected','on_the_way','arrived','in_progress','completed','cancelled_by_customer','cancelled_by_barber','cancelled_by_admin','no_show') NOT NULL DEFAULT 'pending',
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
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 17. BOOKING DETAILS
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
    ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 18. PAYMENTS
-- =========================================================
CREATE TABLE `payments` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `booking_id` BIGINT NOT NULL,
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
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 19. REVIEWS
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
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 20. BOOKING STATUS HISTORY
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
-- 22. VIEWS LAPORAN SEDERHANA
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
  br.id, br.registration_type, u.name, u.email, u.phone, br.business_name, br.city, br.status, br.submitted_at;

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
  u.id, u.name, bp.barber_type, bs.name;

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
  bs.id, bs.name, owner.name;