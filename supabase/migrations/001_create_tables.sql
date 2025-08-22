-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email TEXT UNIQUE NOT NULL,
  username TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建情绪记录表
CREATE TABLE IF NOT EXISTS mood_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  mood_type TEXT NOT NULL CHECK (mood_type IN ('happy', 'sad', 'angry', 'anxious', 'calm', 'excited', 'tired', 'confused')),
  mood_intensity INTEGER NOT NULL CHECK (mood_intensity >= 1 AND mood_intensity <= 5),
  diary_content TEXT,
  photo_url TEXT,
  audio_url TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 启用行级安全策略
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE mood_records ENABLE ROW LEVEL SECURITY;

-- 用户表的RLS策略
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile" ON users
  FOR INSERT WITH CHECK (auth.uid() = id);

-- 情绪记录表的RLS策略
CREATE POLICY "Users can view own mood records" ON mood_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood records" ON mood_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood records" ON mood_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood records" ON mood_records
  FOR DELETE USING (auth.uid() = user_id);

-- 授权给anon和authenticated角色
GRANT SELECT, INSERT, UPDATE, DELETE ON users TO anon, authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON mood_records TO anon, authenticated;

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_mood_records_user_id ON mood_records(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_records_created_at ON mood_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_mood_records_mood_type ON mood_records(mood_type);