-- Run this in your Supabase SQL Editor (https://app.supabase.com/project/_/sql)

-- Create the user_data table
CREATE TABLE IF NOT EXISTS user_data (
    user_id TEXT PRIMARY KEY,
    data JSONB NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Enable RLS (Row Level Security)
ALTER TABLE user_data ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts/updates (using your anon key)
CREATE POLICY "Allow anonymous upsert" ON user_data
    FOR ALL
    TO anon
    USING (true)
    WITH CHECK (true);

-- Create policy to allow anonymous reads
CREATE POLICY "Allow anonymous select" ON user_data
    FOR SELECT
    TO anon
    USING (true);

-- Alternative: If you want to restrict by user_id, use this instead:
-- CREATE POLICY "Allow access by user_id" ON user_data
--     FOR ALL
--     TO anon
--     USING (user_id = current_setting('app.current_user_id', true))
--     WITH CHECK (user_id = current_setting('app.current_user_id', true));
