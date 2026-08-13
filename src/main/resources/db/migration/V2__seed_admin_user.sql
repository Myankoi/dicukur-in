-- Seed Roles Master (1=Admin, 2=Owner, 3=Barber, 4=Customer)

INSERT IGNORE INTO `roles` (`id`, `name`) VALUES
(1, 'Admin'),
(2, 'Owner'),
(3, 'Barber'),
(4, 'Customer');

-- Seed Services Master
INSERT IGNORE INTO `services` (`id`, `name`, `description`, `price`, `duration`, `status`) VALUES
(1, 'Potong Rambut Pria', 'Layanan potong rambut pria standar', 50000.00, 45, 'active'),
(2, 'Potong Rambut Anak', 'Layanan potong rambut untuk anak', 45000.00, 40, 'active'),
(3, 'Cukur Jenggot', 'Layanan cukur dan rapikan jenggot', 30000.00, 25, 'active'),
(4, 'Paket Rambut + Jenggot', 'Potong rambut pria dan cukur jenggot', 75000.00, 70, 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Seed Pricing Rules Master
INSERT IGNORE INTO `pricing_rules` (`id`, `name`, `free_radius_km`, `price_per_km`, `minimum_travel_fee`, `maximum_travel_fee`, `status`) VALUES
(1, 'Harga Jarak Default', 2.00, 5000.00, 0.00, NULL, 'active')
ON DUPLICATE KEY UPDATE `name` = VALUES(`name`);

-- Seed Users Master (Admin)
INSERT IGNORE INTO `users` (`id`, `role_id`, `name`, `email`, `phone`, `password`, `status`) VALUES
(1, 1, 'Admin Dicukur', 'admin@dicukur.com', '081111111111', '$2a$10$akWPrdljucBjodtE0mzBNOFMvURDlx08bT4S4EyRtlPyWVKpfvJqm', 'active')
ON DUPLICATE KEY UPDATE `email` = VALUES(`email`);