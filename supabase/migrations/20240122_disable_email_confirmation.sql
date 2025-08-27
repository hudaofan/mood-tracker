-- 禁用邮箱确认，允许用户注册后直接登录
-- 这个设置将允许用户在注册后无需邮箱确认即可登录

-- 更新现有用户的邮箱确认状态（如果有未确认的用户）
-- confirmed_at是生成列，会自动根据email_confirmed_at更新
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL 
  AND email IS NOT NULL;

-- 注意：要完全禁用邮箱确认，还需要在Supabase Dashboard中设置：
-- Authentication > Settings > Email Auth > Confirm email = OFF
-- 或者通过环境变量设置 GOTRUE_MAILER_AUTOCONFIRM = true