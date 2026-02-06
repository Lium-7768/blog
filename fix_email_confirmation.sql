-- ============================================
-- Fix: Confirm User Email
-- ============================================

-- 方法 1: 直接确认邮箱（推荐）
UPDATE auth.users 
SET email_confirmed_at = NOW(),
    confirmation_token = '',
    confirmation_sent_at = NULL
WHERE email = '840471184@qq.com';

-- 验证是否成功
SELECT email, email_confirmed_at, confirmation_token 
FROM auth.users 
WHERE email = '840471184@qq.com';

-- 如果上面的不工作，尝试这个方法：
-- 方法 2: 重新创建用户（确保所有字段正确）
DO $$
DECLARE
  admin_id uuid := 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11';
  hashed_password text;
BEGIN
  -- 先删除旧用户
  DELETE FROM profiles WHERE id IN (SELECT id FROM auth.users WHERE email = '840471184@qq.com');
  DELETE FROM auth.users WHERE email = '840471184@qq.com';
  
  -- 生成密码哈希
  hashed_password := crypt('admin123', gen_salt('bf'));
  
  -- 创建新用户（已确认邮箱）
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,  -- 关键：设置邮箱已确认
    confirmation_token,  -- 空
    confirmation_sent_at, -- NULL
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    admin_id,
    'authenticated',
    'authenticated',
    '840471184@qq.com',
    hashed_password,
    NOW(),  -- 邮箱已确认
    '',     -- 无确认令牌
    NULL,   -- 无发送记录
    '{"provider":"email","providers":["email"]}',
    '{"name":"admin"}',
    NOW(),
    NOW()
  );
  
  -- 创建 profile
  INSERT INTO profiles (id, name, role, created_at)
  VALUES (admin_id, 'admin', 'admin', NOW())
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    name = 'admin';
    
  RAISE NOTICE 'User created successfully: 840471184@qq.com / admin123';
END $$;

-- 方法 3: 最简单 - 使用 Supabase 的 auth 函数确认
-- SELECT auth.confirm_user_email('840471184@qq.com');