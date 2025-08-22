import { useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Home from '@/pages/Home'
import Record from '@/pages/Record'
import History from '@/pages/History'
import Analytics from '@/pages/Analytics'
import Layout from '@/components/Layout'
import { insertSampleData } from '@/utils/sampleData'
import './App.css'

export default function App() {
  useEffect(() => {
    // 在应用启动时插入示例数据
    insertSampleData()
  }, [])

  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/record" element={<Record />} />
          <Route path="/history" element={<History />} />
          <Route path="/analytics" element={<Analytics />} />
        </Routes>
      </Layout>
    </Router>
  )
}
