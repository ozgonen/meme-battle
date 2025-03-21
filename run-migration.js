#!/usr/bin/env node
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Log environment variables (masked for security)
console.log('Environment check:');
console.log('- NEXT_PUBLIC_SUPABASE_URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? '✅ Set' : '❌ Missing');
console.log('- SUPABASE_SERVICE_ROLE_KEY:', process.env.SUPABASE_SERVICE_ROLE_KEY ? '✅ Set (masked)' : '❌ Missing');

// Validate environment variables
if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Error: Missing required environment variables.');
  console.error('Please ensure the following variables are set in your .env.local file:');
  console.error('- NEXT_PUBLIC_SUPABASE_URL');
  console.error('- SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

// Initialize Supabase client with service role key for admin privileges
console.log('Initializing Supabase client...');
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

async function runMigration() {
  try {
    console.log('Testing Supabase connection...');
    const { data: connTest, error: connError } = await supabase.auth.getSession();
    
    if (connError) {
      console.error('Connection test failed:', connError);
      process.exit(1);
    } else {
      console.log('Connection successful');
    }

    // Create user_roles table
    console.log('Creating user_roles table...');
    const { error: tableError } = await supabase.rpc('create_user_roles_table');
    if (tableError) {
      if (tableError.message.includes('function "create_user_roles_table" does not exist')) {
        console.log('Creating custom SQL function...');
        const { error: fnError } = await supabase.from('_rpc').insert({
          name: 'create_user_roles_table',
          definition: `
            CREATE OR REPLACE FUNCTION create_user_roles_table()
            RETURNS void AS $$
            BEGIN
              -- Create user_roles table
              CREATE TABLE IF NOT EXISTS user_roles (
                id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
                user_id UUID REFERENCES auth.users(id) NOT NULL,
                email TEXT NOT NULL,
                role TEXT NOT NULL DEFAULT 'user',
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
            END;
            $$ LANGUAGE plpgsql;
          `
        });
        
        if (fnError) {
          console.error('Error creating function:', fnError);
        } else {
          // Try to run the function again
          const { error: retry } = await supabase.rpc('create_user_roles_table');
          if (retry) {
            console.error('Still cannot create table:', retry);
            console.log('\nIMPORTANT: You will need to run the schema.sql file manually in the Supabase SQL editor.');
          } else {
            console.log('User roles table created successfully');
          }
        }
      } else {
        console.error('Error creating table:', tableError);
        console.log('\nIMPORTANT: You will need to run the schema.sql file manually in the Supabase SQL editor.');
      }
    } else {
      console.log('User roles table created successfully');
    }

    // Create trigger function for new users
    console.log('Creating user trigger function...');
    const { error: triggerError } = await supabase.rpc('create_user_trigger');
    if (triggerError) {
      if (triggerError.message.includes('function "create_user_trigger" does not exist')) {
        console.log('Creating custom trigger function...');
        const { error: fnError } = await supabase.from('_rpc').insert({
          name: 'create_user_trigger',
          definition: `
            CREATE OR REPLACE FUNCTION create_user_trigger()
            RETURNS void AS $$
            BEGIN
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
            END;
            $$ LANGUAGE plpgsql;
          `
        });
        
        if (fnError) {
          console.error('Error creating trigger function:', fnError);
        } else {
          // Try to run the function again
          const { error: retry } = await supabase.rpc('create_user_trigger');
          if (retry) {
            console.error('Still cannot create trigger:', retry);
          } else {
            console.log('User trigger created successfully');
          }
        }
      } else {
        console.error('Error creating trigger:', triggerError);
      }
    } else {
      console.log('User trigger created successfully');
    }

    // Manually set admin role for existing user
    console.log('Setting up admin user...');
    try {
      // First check if the user already exists
      const { data: users, error: userError } = await supabase.auth.admin.listUsers();
      
      if (userError) {
        console.error('Could not check for existing users:', userError);
      } else {
        const adminUser = users?.users?.find(u => u.email === 'ozownz@gmail.com');
        
        if (adminUser) {
          console.log('Found existing admin user:', adminUser.email);
          
          // Insert the admin role
          const { error: roleError } = await supabase
            .from('user_roles')
            .upsert({
              user_id: adminUser.id,
              email: adminUser.email,
              role: 'admin'
            }, { onConflict: 'user_id' });
            
          if (roleError) {
            console.error('Error setting admin role:', roleError);
          } else {
            console.log('Admin role set successfully');
          }
        } else {
          console.log('Admin user not found. Will be set when they sign up.');
        }
      }
    } catch (adminError) {
      console.error('Error setting up admin user:', adminError);
    }

    console.log('\nMigration completed!');
    console.log('\nIMPORTANT: If you encountered errors, you may need to run the schema.sql file manually');
    console.log('in the Supabase SQL Editor at https://supabase.com/dashboard/project/_/sql');
    
  } catch (err) {
    console.error('Migration script error:', err);
    process.exit(1);
  }
}

runMigration(); 