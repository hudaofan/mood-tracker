-- 检查并授予mood_records表的权限
-- 只授予权限，不创建已存在的策略

-- 1. 检查当前权限
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'mood_records'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- 2. 授予角色权限（如果还没有的话）
-- 给authenticated角色授予完整权限
GRANT ALL PRIVILEGES ON mood_records TO authenticated;

-- 给anon角色授予基本权限
GRANT SELECT, INSERT, UPDATE, DELETE ON mood_records TO anon;

-- 3. 确保序列权限
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO anon;

-- 4. 再次检查权限
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'mood_records'
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;