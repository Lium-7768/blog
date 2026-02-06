-- ============================================
-- Create Admin User
-- ============================================

-- Step 1: Create user in auth.users (this will auto-create profile via trigger)
-- Note: You need to use Supabase Dashboard or API to create the user with password
-- Then run this SQL to make them admin

-- Option A: If user already exists, update role to admin
UPDATE profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id 
  FROM auth.users 
  WHERE email = 'admin@yourdomain.com'
);

-- Option B: Create admin user directly (requires admin privileges)
-- This uses the Supabase Auth API internally
-- You'll need to set the password separately in the Dashboard

-- First, check if the user exists
SELECT * FROM auth.users WHERE email = 'admin@example.com';

-- If not exists, you must create via:
-- 1. Supabase Dashboard → Authentication → Users → Add User
-- 2. Or use the registration page on your frontend

-- After user is created, run this to make them admin:
UPDATE profiles SET role = 'admin' WHERE name = 'admin';

-- Or update by email:
-- UPDATE profiles 
-- SET role = 'admin' 
-- FROM auth.users 
-- WHERE profiles.id = auth.users.id 
-- AND auth.users.email = 'admin@example.com';