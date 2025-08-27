import React, { useState, ReactNode } from 'react'
import { Home, BarChart3, Calendar, PlusCircle, User, LogOut } from 'lucide-react'
import { useLocation, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { AuthModal } from './Auth/AuthModal'
import { useAuthContext } from '../contexts/AuthContext'

interface LayoutProps {
  children: ReactNode
}

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/record', icon: PlusCircle, label: '记录' },
  { path: '/history', icon: Calendar, label: '历史' },
  { path: '/analytics', icon: BarChart3, label: '分析' }
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()
  const { user, signOut, isAuthenticated, loading } = useAuthContext()
  const [showAuthModal, setShowAuthModal] = useState(false)

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50 overflow-x-hidden">
      {/* 顶部用户区域 */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img 
              src="/logo.svg" 
              alt="心情日记" 
              className="w-8 h-8"
            />
            <div>
              <h1 className="text-lg font-semibold text-gray-800">心情日记</h1>
              <p className="text-xs text-gray-500">记录每一天的美好</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  {user.user_metadata?.avatar_url ? (
                    <img 
                      src={user.user_metadata.avatar_url} 
                      alt="用户头像" 
                      className="w-8 h-8 rounded-full"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                  )}
                  <span className="text-sm text-gray-600 max-w-[120px] truncate" title={user.user_metadata?.full_name || user.email}>
                    {user.user_metadata?.full_name || (user.email ? user.email.split('@')[0] : '用户')}
                  </span>
                </div>
                <button
                  onClick={signOut}
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                  title="登出"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm hover:bg-blue-600 transition-colors"
              >
                登录
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <main className="pb-20 overflow-x-hidden">
        {children}
      </main>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-purple-100 px-4 py-2 z-50">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive = location.pathname === item.path
            
            return (
              <Link
                key={item.path}
                to={item.path}
                className="relative flex flex-col items-center py-2 px-3 rounded-2xl transition-all duration-300"
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute inset-0 bg-gradient-to-r from-purple-200 to-blue-200 rounded-2xl"
                    initial={false}
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <div className="relative z-10 flex flex-col items-center">
                  <Icon 
                    size={20} 
                    className={`transition-colors duration-300 ${
                      isActive ? 'text-purple-600' : 'text-gray-400'
                    }`} 
                  />
                  <span 
                    className={`text-xs mt-1 transition-colors duration-300 ${
                      isActive ? 'text-purple-600 font-medium' : 'text-gray-400'
                    }`}
                  >
                    {item.label}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* 认证模态框 */}
      <AuthModal 
        isOpen={showAuthModal} 
        onClose={() => setShowAuthModal(false)} 
      />
    </div>
  )
}