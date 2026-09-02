-- V6: Normalize the role catalog to the IDs used by the application seed.
-- The original initdb script had Owner/Barber/Customer in a different order,
-- which caused seeded users to receive the wrong application role.

-- Move existing names out of the unique-key slots before swapping them.
UPDATE `roles`
SET `name` = CONCAT('__dicukur_role_', `id`)
WHERE `id` IN (1, 2, 3, 4);

UPDATE `roles`
SET `name` = CASE `id`
    WHEN 1 THEN 'Admin'
    WHEN 2 THEN 'Owner'
    WHEN 3 THEN 'Barber'
    WHEN 4 THEN 'Customer'
END
WHERE `id` IN (1, 2, 3, 4);
