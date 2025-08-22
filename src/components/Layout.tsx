import { ReactNode } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, PlusCircle, Calendar, TrendingUp } from 'lucide-react'

interface LayoutProps {
  children: ReactNode
}

const navItems = [
  { path: '/', icon: Home, label: '首页' },
  { path: '/record', icon: PlusCircle, label: '记录' },
  { path: '/history', icon: Calendar, label: '历史' },
  { path: '/analytics', icon: TrendingUp, label: '分析' }
]

export default function Layout({ children }: LayoutProps) {
  const location = useLocation()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* 主内容区域 */}
      <main className="pb-20">
        {children}
      </main>

      {/* 底部导航栏 */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-purple-100 px-4 py-2">
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
    </div>
  )
}