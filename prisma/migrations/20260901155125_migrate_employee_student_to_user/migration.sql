-- Employee/Student are being replaced by a single USER role driven entirely by the new
-- `permissions` toggles. Preserve each account's existing effective access as explicit
-- permissions before the distinction disappears.

-- Employees had full content CRUD and could manage Student accounts (which are now just
-- USER accounts, so "manage students" becomes "manage other users").
UPDATE "User"
SET permissions = '["content.edit","content.new_version","content.delete","users.view","users.edit","users.delete"]'::jsonb,
    role = 'USER'
WHERE role = 'EMPLOYEE';

-- Students were read-only (viewing stays open to everyone regardless of permissions) and
-- had no user-management capability — nothing to grant.
UPDATE "User"
SET role = 'USER'
WHERE role = 'STUDENT';