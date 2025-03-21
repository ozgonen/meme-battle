# Manual RBAC Setup Guide

Since the automated migration script encountered authentication issues, follow these manual steps to set up Role-Based Access Control (RBAC) in your Supabase project.

## Steps to Manually Configure RBAC

### 1. Access Supabase SQL Editor

1. Log in to your [Supabase Dashboard](https://supabase.com/dashboard/)
2. Select your project
3. Navigate to the SQL Editor in the left sidebar
4. Click "New Query" to create a new SQL query

### 2. Create User Roles Table and Policies

Copy and paste the following SQL code into the editor:

```sql
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
DROP POLICY IF EXISTS user_roles_select_policy ON user_roles;
CREATE POLICY user_roles_select_policy ON user_roles
  FOR SELECT TO authenticated
  USING (true);

-- Only admin can insert/update/delete roles
DROP POLICY IF EXISTS user_roles_insert_policy ON user_roles;
CREATE POLICY user_roles_insert_policy ON user_roles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    ) OR NOT EXISTS (SELECT 1 FROM user_roles)
  );
```

Click "Run" to execute this SQL.

### 3. Configure Battle Creation Policies

Copy and paste the following SQL code into a new query:

```sql
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
```

Click "Run" to execute this SQL.

### 4. Create User Trigger for Automatic Role Assignment

Copy and paste the following SQL code into a new query:

```sql
-- Create function to set admin role after sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email = 'ozownz@gmail.com' THEN
    INSERT INTO public.user_roles (user_id, email, role)
    VALUES (NEW.id, NEW.email, 'admin')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'admin';
  ELSE
    INSERT INTO public.user_roles (user_id, email, role)
    VALUES (NEW.id, NEW.email, 'user')
    ON CONFLICT (user_id) 
    DO UPDATE SET role = 'user';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
```

Click "Run" to execute this SQL.

### 5. Manually Set Admin Role for Existing User

If you've already signed up with ozownz@gmail.com, run this SQL to make that user an admin:

```sql
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
```

Click "Run" to execute this SQL.

## Verification

To verify that RBAC is working properly:

1. If you're already logged in with ozownz@gmail.com, log out and log back in.
2. Visit your profile page - you should see an ADMIN badge and the "Create a Battle" button.
3. Try creating a battle - it should work.
4. Log in with a different email address - the "Create a Battle" button should be hidden, and attempting to access the battle creation page directly should redirect you to the profile page with an error message.

## Troubleshooting

If you encounter any issues:

1. Check that all SQL queries ran successfully without errors
2. Verify that the user_roles table was created by navigating to the "Table Editor" in Supabase
3. Check that any existing user with ozownz@gmail.com has been assigned the admin role
4. Ensure that the trigger for new users was created correctly

If problems persist, you may need to check the Supabase logs or modify the SQL based on any error messages you receive. 