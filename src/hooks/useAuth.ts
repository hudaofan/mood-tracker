import { useState, useEffect, useRef } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/lib/supabase'
import { toast } from 'sonner'
import { insertSampleData } from '@/utils/sampleData'

export interface AuthState {
  user: User | null
  session: Session | null
  loading: boolean
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    session: null,
    loading: true
  })
  
  // 使用useRef避免useEffect无限循环
  const isInitialLoadRef = useRef(true)
  const hasShownLoginToastRef = useRef(false)
  const authListenerRef = useRef<any>(null)

  useEffect(() => {
    // 获取初始会话
    const getInitialSession = async () => {
      try {
        console.log('开始获取初始会话...')
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('获取会话失败:', error)
          toast.error('获取用户信息失败')
        } else {
          console.log('初始会话获取成功:', session ? '已登录' : '未登录')
        }
        
        setAuthState({
          user: session?.user ?? null,
          session,
          loading: false
        })
        
        // 标记初始加载完成
        isInitialLoadRef.current = false
      } catch (error) {
        console.error('获取初始会话异常:', error)
        setAuthState({
          user: null,
          session: null,
          loading: false
        })
        isInitialLoadRef.current = false
      }
    }

    getInitialSession()

    // 监听认证状态变化 - 只设置一次，避免重复监听
    if (!authListenerRef.current) {
      console.log('设置认证状态监听器...')
      const { data: { subscription } } = supabase.auth.onAuthStateChange(
        async (event, session) => {
          console.log('认证状态变化:', event, session?.user?.email || '无用户')
          
          setAuthState({
            user: session?.user ?? null,
            session,
            loading: false
          })

          // 只在用户主动登录时显示提示，避免初始加载和重复提示
          if (event === 'SIGNED_IN') {
            if (!isInitialLoadRef.current && !hasShownLoginToastRef.current) {
              console.log('显示登录成功提示')
              toast.success('登录成功！')
              hasShownLoginToastRef.current = true
              // 用户首次登录后插入示例数据
              insertSampleData().catch(error => {
                console.error('插入示例数据失败:', error)
              })
            } else {
              console.log('跳过登录提示 - 初始加载或已显示过')
            }
          } else if (event === 'SIGNED_OUT') {
            console.log('用户登出')
            toast.success('已退出登录')
            hasShownLoginToastRef.current = false
          }
        }
      )
      
      authListenerRef.current = subscription
    }

    return () => {
      if (authListenerRef.current) {
        console.log('清理认证监听器')
        authListenerRef.current.unsubscribe()
        authListenerRef.current = null
      }
    }
  }, []) // 空依赖数组，避免无限循环

  // 邮箱注册
  const signUp = async (email: string, password: string) => {
    try {
      console.log('开始邮箱注册:', email)
      setAuthState(prev => ({ ...prev, loading: true }))
      
      // 使用最简单的注册方式，并添加更多调试信息
      const requestData = { email, password }
      console.log('发送注册请求:', requestData)
      
      const { data, error } = await supabase.auth.signUp(requestData)
      
      console.log('Supabase注册响应 - data:', data)
      console.log('Supabase注册响应 - error:', error)

      console.log('注册响应:', { data, error })

      if (error) {
        console.error('注册错误详情:', error)
        throw error
      }

      if (data.user) {
        console.log('注册成功，用户数据:', {
          id: data.user.id,
          email: data.user.email,
          email_confirmed_at: data.user.email_confirmed_at,
          created_at: data.user.created_at
        })
        
        // 检查用户是否需要邮箱确认
        if (data.user.email_confirmed_at) {
          toast.success('注册成功！可以直接登录')
        } else {
          // 如果需要邮箱确认，提示用户
          toast.success('注册成功！如需邮箱确认请检查邮箱，否则可直接登录')
        }
      } else {
        console.warn('注册响应中没有用户数据')
        toast.success('注册请求已发送，请尝试登录')
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('注册失败:', error)
      const errorMessage = error.message || '注册失败'
      toast.error(`注册失败: ${errorMessage}`)
      return { data: null, error }
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }

  // 邮箱登录
  const signIn = async (email: string, password: string) => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('登录错误详情:', error)
        throw error
      }

      if (data.user) {
        console.log('邮箱登录成功，用户数据:', data.user.email)
        // 重置登录提示状态，允许显示登录成功提示
        hasShownLoginToastRef.current = false
      }

      return { data, error: null }
    } catch (error: any) {
      console.error('登录失败:', error)
      let errorMessage = error.message || '登录失败'
      
      // 提供更友好的错误信息
      if (error.message?.includes('Invalid login credentials')) {
        errorMessage = '邮箱或密码错误，请检查后重试'
      } else if (error.message?.includes('Email not confirmed')) {
        errorMessage = '请先确认邮箱后再登录'
      }
      
      toast.error(errorMessage)
      return { data: null, error }
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }

  // GitHub登录
  const signInWithGitHub = async () => {
    try {
      console.log('开始GitHub登录...')
      setAuthState(prev => ({ ...prev, loading: true }))
      
      // 重置登录提示状态，允许显示登录成功提示
      hasShownLoginToastRef.current = false
      
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      })

      if (error) {
        console.error('GitHub登录错误详情:', error)
        throw error
      }

      console.log('GitHub登录请求成功，等待OAuth回调...')
      return { data, error: null }
    } catch (error: any) {
      console.error('GitHub登录失败:', error)
      toast.error(error.message || 'GitHub登录失败')
      return { data: null, error }
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }

  // 登出
  const signOut = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true }))
      // 重置登录提示状态，允许下次登录显示提示
      hasShownLoginToastRef.current = false
      const { error } = await supabase.auth.signOut()
      if (error) throw error
    } catch (error: any) {
      console.error('登出失败:', error)
      toast.error(error.message || '登出失败')
    } finally {
      setAuthState(prev => ({ ...prev, loading: false }))
    }
  }

  // 重置密码
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`
      })

      if (error) throw error

      toast.success('密码重置邮件已发送，请检查邮箱')
      return { data, error: null }
    } catch (error: any) {
      console.error('密码重置失败:', error)
      toast.error(error.message || '密码重置失败')
      return { data: null, error }
    }
  }

  return {
    ...authState,
    signUp,
    signIn,
    signInWithGitHub,
    signOut,
    resetPassword,
    isAuthenticated: !!authState.user
  }
}