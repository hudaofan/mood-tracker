import { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuthContext } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: ReactNode
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated, loading } = useAuthContext()

  // 如果正在加载认证状态，显示加载界面
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500"></div>
      </div>
    )
  }

  // 如果未认证，重定向到首页（首页会显示登录按钮）
  if (!isAuthenticated) {
    return <Navigate to="/" replace />
  }

  // 如果已认证，渲染子组件
  return <>{children}</>
}