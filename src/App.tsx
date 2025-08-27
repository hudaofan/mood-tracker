import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'sonner'
import Home from '@/pages/Home'
import Record from '@/pages/Record'
import History from '@/pages/History'
import Analytics from '@/pages/Analytics'
import { AuthCallback } from '@/pages/AuthCallback'
import Layout from '@/components/Layout'
import ProtectedRoute from '@/components/ProtectedRoute'
import { AuthProvider } from '@/contexts/AuthContext'
import './App.css'

export default function App() {

  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route path="/*" element={
            <Layout>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/record" element={
                  <ProtectedRoute>
                    <Record />
                  </ProtectedRoute>
                } />
                <Route path="/history" element={
                  <ProtectedRoute>
                    <History />
                  </ProtectedRoute>
                } />
                <Route path="/analytics" element={
                  <ProtectedRoute>
                    <Analytics />
                  </ProtectedRoute>
                } />
              </Routes>
            </Layout>
          } />
        </Routes>
        <Toaster position="top-center" richColors />
      </Router>
    </AuthProvider>
  )
}
