import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { toast } from 'sonner'

export const AuthCallback: React.FC = () => {
  const navigate = useNavigate()

  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('认证回调错误:', error)
          toast.error('登录失败，请重试')
          navigate('/login')
          return
        }

        if (data.session) {
          toast.success('登录成功！')
          navigate('/')
        } else {
          navigate('/login')
        }
      } catch (error) {
        console.error('处理认证回调时出错:', error)
        toast.error('登录过程中出现错误')
        navigate('/login')
      }
    }

    handleAuthCallback()
  }, [navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600">正在处理登录...</p>
      </div>
    </div>
  )
}