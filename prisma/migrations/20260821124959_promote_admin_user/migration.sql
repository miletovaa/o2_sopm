-- The seeded "admin" account was created before the ADMIN role existed, so
-- it's stuck as EMPLOYEE. Promote it now that ADMIN is a real role.
UPDATE "User" SET role = 'ADMIN' WHERE username = 'admin';