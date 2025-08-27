import React, { useState } from 'react'
import { Mail, Lock, Github, Eye, EyeOff } from 'lucide-react'
import { useAuthContext } from '../../contexts/AuthContext'

interface LoginFormProps {
  onSwitchToRegister: () => void
  onClose?: () => void
}

export const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onClose }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isEmailLoading, setIsEmailLoading] = useState(false)
  const [isGitHubLoading, setIsGitHubLoading] = useState(false)
  const { signIn, signInWithGitHub } = useAuthContext()

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !password) return

    setIsEmailLoading(true)
    const { data, error } = await signIn(email, password)
    setIsEmailLoading(false)

    if (data && !error) {
      onClose?.()
    }
  }

  const handleGitHubLogin = async () => {
    setIsGitHubLoading(true)
    await signInWithGitHub()
    setIsGitHubLoading(false)
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white rounded-2xl shadow-lg">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">欢迎回来</h2>
        <p className="text-gray-600">登录您的心情记录账户</p>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="email"
            placeholder="邮箱地址"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
        </div>

        <div className="relative">
          <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder="密码"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full pl-10 pr-12 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <button
          type="submit"
          disabled={isEmailLoading || !email || !password}
          className="w-full py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98]"
        >
          {isEmailLoading ? '登录中...' : '登录'}
        </button>
      </form>

      <div className="my-6 flex items-center">
        <div className="flex-1 border-t border-gray-200"></div>
        <span className="px-4 text-gray-500 text-sm">或</span>
        <div className="flex-1 border-t border-gray-200"></div>
      </div>

      <button
        onClick={handleGitHubLogin}
        disabled={isGitHubLoading}
        className="w-full py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <Github className="w-5 h-5" />
        {isGitHubLoading ? '登录中...' : '使用 GitHub 登录'}
      </button>

      <div className="mt-6 text-center">
        <p className="text-gray-600">
          还没有账户？{' '}
          <button
            onClick={onSwitchToRegister}
            className="text-blue-600 hover:text-blue-700 font-medium transition-colors"
          >
            立即注册
          </button>
        </p>
      </div>
    </div>
  )
}