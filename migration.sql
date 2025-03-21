-- Create user_roles table for RBAC
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'admin', 'user'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Enable RLS for user_roles
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read roles
CREATE POLICY user_roles_select_policy ON user_roles
  FOR SELECT TO authenticated
  USING (true);

-- Only admin can insert/update/delete roles
CREATE POLICY user_roles_insert_policy ON user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    ) OR NOT EXISTS (SELECT 1 FROM user_roles)
  );

-- Update battles insert policy to only allow admins
DROP POLICY IF EXISTS battles_insert_policy ON battles;
CREATE POLICY battles_insert_policy ON battles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- Create function to set admin role after sign up (for specific email)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'ozownz@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, email, role)
    VALUES (NEW.id, NEW.email, 'admin');
  ELSE
    INSERT INTO public.user_roles (user_id, email, role)
    VALUES (NEW.id, NEW.email, 'user');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically set roles for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Manually insert admin user if already exists
DO $$
DECLARE
  admin_user_id UUID;
BEGIN
  SELECT id INTO admin_user_id FROM auth.users WHERE email = 'ozownz@gmail.com';
  
  IF admin_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, email, role)
    VALUES (admin_user_id, 'ozownz@gmail.com', 'admin')
    ON CONFLICT (user_id) DO UPDATE SET role = 'admin';
  END IF;
END
$$; 