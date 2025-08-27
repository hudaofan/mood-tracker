import React, { createContext, useContext, ReactNode } from 'react'
import { useAuth, AuthState } from '../hooks/useAuth'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType extends AuthState {
  signUp: (email: string, password: string) => Promise<{ data: any; error: any }>
  signIn: (email: string, password: string) => Promise<{ data: any; error: any }>
  signInWithGitHub: () => Promise<{ data: any; error: any }>
  signOut: () => Promise<void>
  resetPassword: (email: string) => Promise<{ data: any; error: any }>
  isAuthenticated: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuthContext = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const auth = useAuth()

  return (
    <AuthContext.Provider value={auth}>
      {children}
    </AuthContext.Provider>
  )
}

export default AuthContext