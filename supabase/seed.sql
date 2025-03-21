-- Insert admin user if not exists
INSERT INTO auth.users (
  instance_id,
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at
)
VALUES
(
  '00000000-0000-0000-0000-000000000000',
  gen_random_uuid(),
  'ozownz@gmail.com',
  -- This is a dummy placeholder password, users should reset their password on first login
  crypt('admin123', gen_salt('bf')),
  timezone('utc'::text, now()),
  '{"provider": "email", "providers": ["email"]}',
  '{}',
  timezone('utc'::text, now()),
  timezone('utc'::text, now())
)
ON CONFLICT (email) DO NOTHING;

-- Ensure the above user has admin role
INSERT INTO user_roles (user_id, email, role)
SELECT 
  id,
  'ozownz@gmail.com',
  'admin'
FROM 
  auth.users
WHERE 
  email = 'ozownz@gmail.com'
ON CONFLICT (user_id) DO UPDATE SET 
  role = 'admin';

-- Insert sample battles for testing
INSERT INTO battles (title, status, created_by, created_at)
SELECT
  'Sample Meme Battle 1',
  'collecting',
  u.id,
  timezone('utc'::text, now()) - interval '2 days'
FROM
  auth.users u
WHERE
  u.email = 'ozownz@gmail.com'
ON CONFLICT DO NOTHING;

INSERT INTO battles (title, status, created_by, created_at)
SELECT
  'Sample Meme Battle 2',
  'voting',
  u.id,
  timezone('utc'::text, now()) - interval '1 day'
FROM
  auth.users u
WHERE
  u.email = 'ozownz@gmail.com'
ON CONFLICT DO NOTHING; 