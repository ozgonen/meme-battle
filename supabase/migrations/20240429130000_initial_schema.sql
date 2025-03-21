-- Create battles table
CREATE TABLE IF NOT EXISTS battles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'collecting', -- collecting, voting, completed
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create user_roles table for RBAC
CREATE TABLE IF NOT EXISTS user_roles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user', -- 'admin', 'user'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Create participants table
CREATE TABLE IF NOT EXISTS battle_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(battle_id, user_id)
);

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
  participant_id UUID REFERENCES battle_participants(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create votes table
CREATE TABLE IF NOT EXISTS votes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  battle_id UUID REFERENCES battles(id) ON DELETE CASCADE,
  submission_id UUID REFERENCES submissions(id) ON DELETE CASCADE,
  voter_id UUID REFERENCES battle_participants(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL, -- 'like', 'dislike'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(submission_id, voter_id) -- prevent duplicate votes
);

-- Create RLS policies
-- Battles
ALTER TABLE battles ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read battles
CREATE POLICY battles_select_policy ON battles
  FOR SELECT TO authenticated
  USING (true);

-- Only the battle creator can update their battles
CREATE POLICY battles_update_policy ON battles
  FOR UPDATE TO authenticated
  USING (auth.uid() = created_by);

-- Only the battle creator can delete their battles
CREATE POLICY battles_delete_policy ON battles
  FOR DELETE TO authenticated
  USING (auth.uid() = created_by);

-- Only admin users can create battles
CREATE POLICY battles_insert_policy ON battles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_roles 
      WHERE user_roles.user_id = auth.uid() 
      AND user_roles.role = 'admin'
    )
  );

-- User Roles
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

-- Participants
ALTER TABLE battle_participants ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read participants
CREATE POLICY participants_select_policy ON battle_participants
  FOR SELECT TO authenticated
  USING (true);

-- Users can only create participant entries for themselves
CREATE POLICY participants_insert_policy ON battle_participants
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Submissions
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read submissions
CREATE POLICY submissions_select_policy ON submissions
  FOR SELECT TO authenticated
  USING (true);

-- Users can only create submission entries for themselves
CREATE POLICY submissions_insert_policy ON submissions
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM battle_participants
    WHERE battle_participants.id = participant_id
    AND battle_participants.user_id = auth.uid()
  ));

-- Votes
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;

-- Any authenticated user can read votes
CREATE POLICY votes_select_policy ON votes
  FOR SELECT TO authenticated
  USING (true);

-- Users can only create vote entries for themselves
CREATE POLICY votes_insert_policy ON votes
  FOR INSERT TO authenticated
  WITH CHECK (EXISTS (
    SELECT 1 FROM battle_participants
    WHERE battle_participants.id = voter_id
    AND battle_participants.user_id = auth.uid()
  ));

-- Storage bucket for meme uploads
INSERT INTO storage.buckets (id, name, public) VALUES ('memes', 'memes', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policy to allow authenticated users to upload memes
CREATE POLICY storage_policy ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'memes');

-- Storage policy to allow public access to memes
CREATE POLICY storage_select_policy ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'memes');

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
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user(); 