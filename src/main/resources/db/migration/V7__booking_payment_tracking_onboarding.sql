ALTER TABLE booking_details
    ADD COLUMN participant_name VARCHAR(100) NOT NULL DEFAULT 'Peserta 1' AFTER booking_id,
    ADD COLUMN sequence_number INT NOT NULL DEFAULT 1 AFTER participant_name;

ALTER TABLE bookings
    ADD COLUMN payment_deadline DATETIME NULL AFTER payment_status,
    ADD COLUMN location_accuracy DECIMAL(8,2) NULL AFTER barber_longitude,
    ADD COLUMN location_updated_at DATETIME NULL AFTER location_accuracy,
    MODIFY COLUMN status ENUM('pending','accepted','rejected','on_the_way','arrived','in_progress','completed','cancelled_by_customer','cancelled_by_barber','cancelled_by_admin','cancelled_unpaid','no_show') NOT NULL DEFAULT 'pending',
    MODIFY COLUMN payment_status ENUM('unpaid','waiting_verification','paid','failed','refund_pending','refunded') NOT NULL DEFAULT 'unpaid';

ALTER TABLE payments
    MODIFY COLUMN payment_method VARCHAR(30) NOT NULL,
    MODIFY COLUMN status ENUM('pending','waiting_verification','paid','failed','cancelled','refund_pending','refunded') NOT NULL DEFAULT 'pending',
    ADD COLUMN refund_reason TEXT NULL AFTER notes,
    ADD COLUMN refund_reference VARCHAR(120) NULL AFTER refund_reason,
    ADD COLUMN refund_proof VARCHAR(255) NULL AFTER refund_reference,
    ADD COLUMN refunded_at DATETIME NULL AFTER refund_proof;

ALTER TABLE barber_registrations
    MODIFY COLUMN registration_type VARCHAR(30) NOT NULL,
    ADD COLUMN barbershop_id BIGINT NULL AFTER applicant_id,
    ADD KEY idx_registrations_barbershop (barbershop_id),
    ADD CONSTRAINT fk_registrations_barbershop FOREIGN KEY (barbershop_id) REFERENCES barbershops(id) ON DELETE SET NULL;

CREATE TABLE staff_invitations (
    id BIGINT NOT NULL AUTO_INCREMENT,
    barbershop_id BIGINT NOT NULL,
    invited_by BIGINT NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NULL,
    position VARCHAR(100) NULL,
    token_hash VARCHAR(128) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    expires_at DATETIME NOT NULL,
    accepted_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uk_staff_invitation_token (token_hash),
    KEY idx_staff_invitation_shop_status (barbershop_id, status),
    CONSTRAINT fk_staff_invitation_shop FOREIGN KEY (barbershop_id) REFERENCES barbershops(id),
    CONSTRAINT fk_staff_invitation_owner FOREIGN KEY (invited_by) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE admin_audit_logs (
    id BIGINT NOT NULL AUTO_INCREMENT,
    admin_id BIGINT NULL,
    action VARCHAR(80) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id BIGINT NULL,
    details TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    KEY idx_audit_created_at (created_at),
    CONSTRAINT fk_audit_admin FOREIGN KEY (admin_id) REFERENCES users(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
