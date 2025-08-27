-- 检查和修复认证相关的权限问题

-- 1. 为anon和authenticated角色授予必要的权限
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mood_records TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.mood_records TO authenticated;

-- 2. 创建或替换用户注册触发器函数
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    username = COALESCE(EXCLUDED.username, users.username),
    avatar_url = COALESCE(EXCLUDED.avatar_url, users.avatar_url),
    updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 创建触发器（如果不存在）
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT OR UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. 更新RLS策略
-- 删除现有策略
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.users;
DROP POLICY IF EXISTS "Users can view own mood records" ON public.mood_records;
DROP POLICY IF EXISTS "Users can insert own mood records" ON public.mood_records;
DROP POLICY IF EXISTS "Users can update own mood records" ON public.mood_records;
DROP POLICY IF EXISTS "Users can delete own mood records" ON public.mood_records;

-- 创建新的RLS策略
-- 用户表策略
CREATE POLICY "Enable read access for authenticated users" ON public.users
  FOR SELECT USING (auth.uid() = id OR auth.role() = 'anon');

CREATE POLICY "Enable insert for authenticated users" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Enable update for users based on id" ON public.users
  FOR UPDATE USING (auth.uid() = id);

-- 情绪记录表策略
CREATE POLICY "Enable read access for own records" ON public.mood_records
  FOR SELECT USING (auth.uid() = user_id OR auth.role() = 'anon');

CREATE POLICY "Enable insert for authenticated users" ON public.mood_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for own records" ON public.mood_records
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Enable delete for own records" ON public.mood_records
  FOR DELETE USING (auth.uid() = user_id);

-- 5. 确保RLS已启用
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.mood_records ENABLE ROW LEVEL SECURITY;

-- 6. 为现有的auth用户创建public.users记录（如果需要）
INSERT INTO public.users (id, email, username, avatar_url)
SELECT 
  id,
  email,
  COALESCE(raw_user_meta_data->>'username', email) as username,
  raw_user_meta_data->>'avatar_url' as avatar_url
FROM auth.users
WHERE id NOT IN (SELECT id FROM public.users)
ON CONFLICT (id) DO NOTHING;