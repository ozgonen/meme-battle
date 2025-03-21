# Role-Based Access Control (RBAC) Implementation

This document explains how RBAC has been implemented in the Meme Battle application to ensure that only admin users (specifically `ozownz@gmail.com`) can create battles.

## Overview

We've implemented a role-based access control system with the following features:

1. A new `user_roles` table to store user roles
2. Database triggers that automatically assign admin role to `ozownz@gmail.com`
3. Row Level Security (RLS) policies that restrict battle creation to admin users
4. UI changes that conditionally show battle creation options

## Database Changes

The following changes were made to the database schema:

- Added a `user_roles` table with fields for user ID, email, and role
- Created a database function `handle_new_user()` and trigger to automatically assign roles
- Updated the RLS policy for battle creation to only allow admin users
- Added policies to control who can view and modify roles

## How to Apply the Changes

Follow these steps to apply the RBAC implementation:

### 1. Run the Migration Script

```bash
# Install dependencies if needed
npm install

# Run the migration
npm run migration
```

This script will:
- Create the necessary tables
- Set up RLS policies
- Create the triggers for automatic role assignment
- Verify if the admin user already exists

### 2. Admin Privileges

After running the migration and signing in with `ozownz@gmail.com`:

- Only this account will see the "Create a Battle" button on the profile page
- Only this account can access the battle creation page
- Any attempt by non-admin users to create battles will redirect to the profile page with an error message

### 3. Automatic Role Assignment

The system automatically handles role assignment:

- New users signing up with `ozownz@gmail.com` will automatically receive the admin role
- All other users will receive the standard user role
- If `ozownz@gmail.com` already exists in the system, the migration script will update their role to admin

## Testing the Implementation

To verify the implementation works correctly:

1. Sign in with `ozownz@gmail.com` - you should see the admin badge and Create Battle button
2. Sign in with any other account - you should NOT see the Create Battle button
3. Try to manually navigate to `/battles/create` with a non-admin account - you should be redirected

## Technical Details

### User Roles Table Structure

```sql
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'admin', 'user'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);
```

### RLS Policy for Battle Creation

```sql
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

### Automatic Role Assignment Trigger

```sql
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
``` 