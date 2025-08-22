import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { TrendingUp, PieChart as PieChartIcon, Cloud } from 'lucide-react'
import { supabase, MOOD_TYPES, MoodRecord } from '@/lib/supabase'

type TimeRange = '7d' | '30d' | '90d'

export default function Analytics() {
  const [records, setRecords] = useState<MoodRecord[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>('30d')
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchRecords()
  }, [])

  const fetchRecords = async () => {
    try {
      const { data, error } = await supabase
        .from('mood_records')
        .select('*')
        .order('created_at', { ascending: true })
      
      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('获取记录失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getFilteredRecords = () => {
    const now = new Date()
    const days = timeRange === '7d' ? 7 : timeRange === '30d' ? 30 : 90
    const cutoff = new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
    
    return records.filter(record => new Date(record.created_at) >= cutoff)
  }

  const getTrendData = () => {
    const filteredRecords = getFilteredRecords()
    const groupedByDate: { [key: string]: number[] } = {}
    
    filteredRecords.forEach(record => {
      const date = new Date(record.created_at).toISOString().split('T')[0]
      if (!groupedByDate[date]) {
        groupedByDate[date] = []
      }
      groupedByDate[date].push(record.mood_intensity)
    })
    
    return Object.entries(groupedByDate)
      .map(([date, intensities]) => ({
        date: new Date(date).toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' }),
        intensity: intensities.reduce((sum, val) => sum + val, 0) / intensities.length,
        count: intensities.length
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }

  const getMoodDistribution = () => {
    const filteredRecords = getFilteredRecords()
    const distribution: { [key: string]: number } = {}
    
    filteredRecords.forEach(record => {
      distribution[record.mood_type] = (distribution[record.mood_type] || 0) + 1
    })
    
    return Object.entries(distribution).map(([moodType, count]) => ({
      name: MOOD_TYPES[moodType].label,
      value: count,
      color: MOOD_TYPES[moodType].color,
      emoji: MOOD_TYPES[moodType].emoji
    }))
  }

  const getWordCloudData = () => {
    const filteredRecords = getFilteredRecords()
    const words: { [key: string]: number } = {}
    
    filteredRecords.forEach(record => {
      if (record.diary_content) {
        // 简单的中文分词（实际项目中可以使用更专业的分词库）
        const text = record.diary_content
          .replace(/[，。！？；：]/g, ' ')
          .replace(/[()（）\[\]【】]/g, ' ')
          .split(/\s+/)
          .filter(word => word.length > 1)
        
        text.forEach(word => {
          words[word] = (words[word] || 0) + 1
        })
      }
    })
    
    return Object.entries(words)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 20)
      .map(([text, value]) => ({ text, value }))
  }

  const trendData = getTrendData()
  const moodDistribution = getMoodDistribution()
  const wordCloudData = getWordCloudData()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-lavender-500"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream-50 to-lavender-50 p-4 pb-20">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* 标题和时间范围选择器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h1 className="text-3xl font-bold text-mist-800">情绪趋势分析</h1>
          <div className="flex justify-center space-x-2">
            {(['7d', '30d', '90d'] as TimeRange[]).map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-2xl font-medium transition-all jelly-button ${
                  timeRange === range
                    ? 'bg-lavender-500 text-white shadow-glow'
                    : 'bg-white/60 text-mist-600 hover:bg-white/80'
                }`}
              >
                {range === '7d' ? '近7天' : range === '30d' ? '近30天' : '近90天'}
              </button>
            ))}
          </div>
        </motion.div>

        {/* 情绪趋势图 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-soft"
        >
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-6 h-6 text-lavender-500" />
            <h2 className="text-xl font-semibold text-mist-800">情绪强度趋势</h2>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis dataKey="date" stroke="#64748b" />
                <YAxis domain={[1, 5]} stroke="#64748b" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'rgba(255, 255, 255, 0.9)',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="intensity"
                  stroke="#8b4cff"
                  strokeWidth={3}
                  dot={{ fill: '#8b4cff', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: '#8b4cff', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* 情绪分布饼图 */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-soft"
          >
            <div className="flex items-center space-x-2 mb-4">
              <PieChartIcon className="w-6 h-6 text-lavender-500" />
              <h2 className="text-xl font-semibold text-mist-800">情绪分布</h2>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={moodDistribution}
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {moodDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'rgba(255, 255, 255, 0.9)',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-2 mt-4">
              {moodDistribution.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  ></div>
                  <span className="text-sm text-mist-600">
                    {item.emoji} {item.name} ({item.value})
                  </span>
                </div>
              ))}
            </div>
          </motion.div>

          {/* 关键词云 */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white/60 backdrop-blur-sm rounded-3xl p-6 shadow-soft"
          >
            <div className="flex items-center space-x-2 mb-4">
              <Cloud className="w-6 h-6 text-lavender-500" />
              <h2 className="text-xl font-semibold text-mist-800">关键词</h2>
            </div>
            <div className="h-64 flex flex-wrap items-center justify-center gap-2 overflow-hidden">
              {wordCloudData.map((word, index) => (
                <span
                  key={index}
                  className="inline-block px-3 py-1 rounded-full bg-gradient-to-r from-lavender-100 to-cream-100 text-mist-700 font-medium transition-all hover:scale-110"
                  style={{
                    fontSize: `${Math.max(12, Math.min(24, word.value * 2))}px`
                  }}
                >
                  {word.text}
                </span>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  )
}