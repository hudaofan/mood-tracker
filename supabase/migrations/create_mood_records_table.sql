-- 创建情绪记录表
CREATE TABLE IF NOT EXISTS mood_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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

-- 创建索引以提高查询性能
CREATE INDEX IF NOT EXISTS idx_mood_records_user_id ON mood_records(user_id);
CREATE INDEX IF NOT EXISTS idx_mood_records_created_at ON mood_records(created_at);
CREATE INDEX IF NOT EXISTS idx_mood_records_mood_type ON mood_records(mood_type);

-- 启用行级安全策略 (RLS)
ALTER TABLE mood_records ENABLE ROW LEVEL SECURITY;

-- 创建RLS策略：用户只能访问自己的记录
CREATE POLICY "Users can view own mood records" ON mood_records
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own mood records" ON mood_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own mood records" ON mood_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own mood records" ON mood_records
  FOR DELETE USING (auth.uid() = user_id);

-- 允许匿名用户插入记录（用于演示目的）
CREATE POLICY "Allow anonymous insert for demo" ON mood_records
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow anonymous select for demo" ON mood_records
  FOR SELECT USING (true);

-- 创建更新时间戳的触发器函数
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 创建触发器
CREATE TRIGGER update_mood_records_updated_at
  BEFORE UPDATE ON mood_records
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 授予权限给anon和authenticated角色
GRANT ALL PRIVILEGES ON mood_records TO anon;
GRANT ALL PRIVILEGES ON mood_records TO authenticated;