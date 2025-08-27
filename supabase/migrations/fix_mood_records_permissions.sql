-- 修复mood_records表的权限问题
-- 添加RLS策略和角色权限

-- 1. 为mood_records表创建RLS策略
-- 允许用户查看自己的记录
CREATE POLICY "Users can view own mood records" ON mood_records
  FOR SELECT USING (auth.uid() = user_id);

-- 允许用户插入自己的记录
CREATE POLICY "Users can insert own mood records" ON mood_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 允许用户更新自己的记录
CREATE POLICY "Users can update own mood records" ON mood_records
  FOR UPDATE USING (auth.uid() = user_id);

-- 允许用户删除自己的记录
CREATE POLICY "Users can delete own mood records" ON mood_records
  FOR DELETE USING (auth.uid() = user_id);

-- 2. 授予角色权限
-- 给authenticated角色授予完整权限
GRANT ALL PRIVILEGES ON mood_records TO authenticated;

-- 给anon角色授予基本读取权限（用于公开数据，如果需要的话）
GRANT SELECT ON mood_records TO anon;

-- 3. 确保序列权限（如果有的话）
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 4. 添加一些示例数据的临时策略（可选）
-- 如果需要插入示例数据而不需要用户认证，可以临时禁用RLS
-- ALTER TABLE mood_records DISABLE ROW LEVEL SECURITY;
-- 插入数据后再启用：
-- ALTER TABLE mood_records ENABLE ROW LEVEL SECURITY;