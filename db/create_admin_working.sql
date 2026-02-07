-- ============================================
-- Create Admin User - Working Version
-- ============================================

-- 方法：使用 auth.uid() 作为 instance_id，并提供所有必需字段

DO $$
DECLARE
  new_user_id uuid := gen_random_uuid();
  hashed_password text;
BEGIN
  -- 生成密码哈希
  hashed_password := crypt('admin123', gen_salt('bf'));
  
  -- 插入到 auth.users
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',  -- instance_id (固定值)
    new_user_id,                              -- id
    'authenticated',                          -- aud
    'authenticated',                          -- role
    'admin@yourblog.com',                     -- email
    hashed_password,                          -- encrypted_password
    now(),                                    -- email_confirmed_at (跳过验证)
    '{"provider":"email","providers":["email"]}',  -- raw_app_meta_data
    '{"name":"admin"}',                       -- raw_user_meta_data
    now(),                                    -- created_at
    now(),                                    -- updated_at
    '',                                       -- confirmation_token (空)
    '',                                       -- email_change (空)
    '',                                       -- email_change_token_new (空)
    ''                                        -- recovery_token (空)
  )
  ON CONFLICT (email) DO UPDATE SET
    encrypted_password = EXCLUDED.encrypted_password,
    email_confirmed_at = EXCLUDED.email_confirmed_at,
    updated_at = now()
  RETURNING id INTO new_user_id;
  
  -- 确保 profile 存在且为 admin
  INSERT INTO profiles (id, name, role, created_at)
  VALUES (new_user_id, 'admin', 'admin', now())
  ON CONFLICT (id) DO UPDATE SET
    role = 'admin',
    name = 'admin';
    
  RAISE NOTICE 'Admin user created/updated with ID: %', new_user_id;
END $$;