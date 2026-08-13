-- =========================================================
-- V5: ADD BARBERSHOP PHOTOS TABLE & PHOTO_URL COLUMN
-- =========================================================

-- 1. Add photo_url column to barbershops
ALTER TABLE `barbershops` ADD COLUMN `photo_url` VARCHAR(500) DEFAULT NULL AFTER `rejection_reason`;

-- 2. Create barbershop_photos table for gallery
CREATE TABLE `barbershop_photos` (
  `id` BIGINT NOT NULL AUTO_INCREMENT,
  `barbershop_id` BIGINT NOT NULL,
  `file_path` VARCHAR(500) NOT NULL,
  `caption` VARCHAR(255) DEFAULT NULL,
  `sort_order` INT NOT NULL DEFAULT 0,
  `uploaded_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  PRIMARY KEY (`id`),
  KEY `idx_barbershop_photos_shop` (`barbershop_id`),

  CONSTRAINT `fk_barbershop_photos_shop`
    FOREIGN KEY (`barbershop_id`) REFERENCES `barbershops` (`id`)
    ON UPDATE CASCADE
    ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
