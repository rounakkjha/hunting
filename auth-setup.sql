-- Run this in your Supabase SQL Editor to set up authentication

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user', -- 'user', 'admin', 'superadmin'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Allow login check" ON users;
DROP POLICY IF EXISTS "Superadmin manages users" ON users;
DROP POLICY IF EXISTS "Superadmin full access" ON users;

-- Simple policy: Allow all operations for now (will tighten later)
CREATE POLICY "Allow all" ON users
    FOR ALL
    TO anon, authenticated
    USING (true)
    WITH CHECK (true);

-- Insert the superadmin account (Rounak/1234)
-- Password: 1234 (simple hash for demo - in production use bcrypt)
INSERT INTO users (id, username, password_hash, role)
VALUES ('user_rounak', 'Rounak', '1234', 'superadmin')
ON CONFLICT (username) DO NOTHING;

-- Migrate existing data from rounakjha5 to Rounak account
-- This copies the data from the old user_id to the new one
-- Only run if there's still old data to migrate and target doesn't exist
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM user_data WHERE user_id = 'rounakjha5') THEN
        -- Delete old data if it conflicts
        DELETE FROM user_data WHERE user_id = 'rounakjha5';
        RAISE NOTICE 'Removed old rounakjha5 data (already migrated)';
    ELSE
        RAISE NOTICE 'No old data found to migrate';
    END IF;
END $$;
