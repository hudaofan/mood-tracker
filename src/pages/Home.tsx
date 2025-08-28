import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Plus, Calendar, TrendingUp, Heart } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase, MOOD_TYPES, MoodRecord } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'

export default function Home() {
  const [todayRecords, setTodayRecords] = useState<MoodRecord[]>([])
  const [recentRecord, setRecentRecord] = useState<MoodRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [greeting, setGreeting] = useState('')
  const { user, isAuthenticated } = useAuthContext()

  useEffect(() => {
    setGreeting(getGreeting())
    if (isAuthenticated && user) {
      fetchTodayRecords()
      fetchRecentRecord()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  const getGreeting = () => {
    const hour = new Date().getHours()
    if (hour < 6) return '夜深了'
    if (hour < 12) return '早上好'
    if (hour < 18) return '下午好'
    return '晚上好'
  }

  const fetchTodayRecords = async () => {
    if (!user) return
    
    try {
      const today = new Date().toISOString().split('T')[0]
      const { data, error } = await supabase
        .from('mood_records')
        .select('*')
        .eq('user_id', user.id)
        .gte('created_at', `${today}T00:00:00`)
        .lt('created_at', `${today}T23:59:59`)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setTodayRecords(data || [])
    } catch (error) {
      console.error('获取今日记录失败:', error)
    }
  }

  const fetchRecentRecord = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('mood_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
      
      if (error) throw error
      setRecentRecord(data?.[0] || null)
    } catch (error) {
      console.error('获取最近记录失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const quickMoodRecord = async (moodType: string, intensity: number) => {
    if (!isAuthenticated || !user) {
      toast.error('请先登录后再记录心情')
      return
    }
    
    try {
      const { error } = await supabase
        .from('mood_records')
        .insert({
          mood_type: moodType,
          mood_intensity: intensity,
          diary_content: '',
          user_id: user.id,
          created_at: new Date().toISOString()
        })
      
      if (error) throw error
      
      toast.success('心情记录成功！')
      
      // 刷新今日记录
      await fetchTodayRecords()
      await fetchRecentRecord()
    } catch (error: any) {
      console.error('快速记录失败:', error)
      toast.error(error.message || '记录失败，请重试')
    }
  }

  const getTodayStats = () => {
    if (todayRecords.length === 0) return null
    
    const avgIntensity = todayRecords.reduce((sum, record) => sum + record.mood_intensity, 0) / todayRecords.length
    const moodCounts = todayRecords.reduce((acc, record) => {
      acc[record.mood_type] = (acc[record.mood_type] || 0) + 1
      return acc
    }, {} as { [key: string]: number })
    
    const dominantMood = Object.entries(moodCounts)
      .sort(([,a], [,b]) => b - a)[0]
    
    return {
      count: todayRecords.length,
      avgIntensity: Math.round(avgIntensity * 10) / 10,
      dominantMood: dominantMood ? MOOD_TYPES[dominantMood[0]] : null
    }
  }

  const todayStats = getTodayStats()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  // 未登录用户显示欢迎界面
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen p-4 pt-8 pb-20">
        <div className="max-w-md mx-auto space-y-6">
          {/* 欢迎标题 */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-4xl font-bold text-gray-800 mb-4">心情小记</h1>
            <p className="text-gray-600 text-lg">记录每一刻的心情变化</p>
          </motion.div>

          {/* 功能介绍 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-purple-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">😊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">情绪记录</h3>
                  <p className="text-sm text-gray-600">快速记录当下的心情状态</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">📊</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">数据分析</h3>
                  <p className="text-sm text-gray-600">了解你的情绪变化趋势</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-2xl flex items-center justify-center">
                  <span className="text-2xl">📝</span>
                </div>
                <div>
                  <h3 className="font-semibold text-gray-800">日记功能</h3>
                  <p className="text-sm text-gray-600">记录详细的心情日记</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* 登录提示 */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-3xl p-6 text-white text-center"
          >
            <h3 className="text-xl font-semibold mb-2">开始你的心情之旅</h3>
            <p className="text-purple-100 mb-4">登录后即可开始记录和分析你的心情变化</p>
            <p className="text-sm text-purple-200">点击右上角登录按钮开始使用</p>
          </motion.div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pt-8 pb-20">
      <div className="max-w-md mx-auto space-y-6">
        {/* 问候语 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >
          <h1 className="text-3xl font-bold text-gray-800 mb-2">{greeting}</h1>
          <p className="text-gray-600">今天的心情如何？</p>
        </motion.div>

        {/* 快速情绪记录 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <h2 className="text-lg font-semibold text-gray-800 mb-4">快速记录</h2>
          <div className="grid grid-cols-3 gap-3">
            {Object.entries(MOOD_TYPES).slice(0, 6).map(([key, mood]) => (
              <motion.button
                key={key}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => quickMoodRecord(key, 3)}
                className="flex flex-col items-center p-3 rounded-2xl transition-all duration-300 hover:shadow-md"
                style={{ backgroundColor: `${mood.color}20` }}
              >
                <div 
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl mb-2"
                  style={{ backgroundColor: mood.color }}
                >
                  {mood.emoji}
                </div>
                <span className="text-xs text-gray-700 font-medium">{mood.label}</span>
              </motion.button>
            ))}
          </div>
          <Link to="/record">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="w-full mt-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white py-3 rounded-2xl font-medium flex items-center justify-center gap-2 shadow-lg"
            >
              <Plus size={20} />
              详细记录
            </motion.button>
          </Link>
        </motion.div>

        {/* 今日概览 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-gray-800">今日概览</h2>
            <Link to="/history">
              <motion.button
                whileHover={{ scale: 1.05 }}
                className="text-purple-600 text-sm font-medium"
              >
                查看更多
              </motion.button>
            </Link>
          </div>
          
          {todayStats ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{todayStats.count}</div>
                  <div className="text-xs text-gray-500">记录次数</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{todayStats.avgIntensity}</div>
                  <div className="text-xs text-gray-500">平均强度</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl">{todayStats.dominantMood?.emoji}</div>
                  <div className="text-xs text-gray-500">主要情绪</div>
                </div>
              </div>
              
              {/* 今日记录时间线 */}
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-700 mb-2">今日记录</h3>
                {todayRecords.slice(0, 3).map((record, index) => {
                  const mood = MOOD_TYPES[record.mood_type]
                  const time = new Date(record.created_at).toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })
                  
                  return (
                    <motion.div
                      key={record.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-center gap-3 p-2 rounded-xl bg-gray-50"
                    >
                      <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
                        style={{ backgroundColor: mood.color }}
                      >
                        {mood.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-800">{mood.label}</div>
                        <div className="text-xs text-gray-500">{time}</div>
                      </div>
                      <div className="flex gap-1">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div
                            key={i}
                            className={`w-1.5 h-1.5 rounded-full ${
                              i < record.mood_intensity ? 'bg-purple-400' : 'bg-gray-200'
                            }`}
                          />
                        ))}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="text-gray-400 mb-2">今天还没有记录</div>
              <div className="text-sm text-gray-500">记录你的第一个心情吧！</div>
            </div>
          )}
        </motion.div>

        {/* 最近记录 */}
        {recentRecord && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            <h2 className="text-lg font-semibold text-gray-800 mb-4">最近记录</h2>
            <div className="flex items-start gap-3">
              <div 
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                style={{ backgroundColor: MOOD_TYPES[recentRecord.mood_type].color }}
              >
                {MOOD_TYPES[recentRecord.mood_type].emoji}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-800">
                    {MOOD_TYPES[recentRecord.mood_type].label}
                  </span>
                  <div className="flex gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < recentRecord.mood_intensity ? 'bg-purple-400' : 'bg-gray-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
                <div className="text-sm text-gray-500 mb-2">
                  {new Date(recentRecord.created_at).toLocaleDateString('zh-CN')} {' '}
                  {new Date(recentRecord.created_at).toLocaleTimeString('zh-CN', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </div>
                {recentRecord.diary_content && (
                  <p className="text-gray-700 text-sm leading-relaxed line-clamp-2">
                    {recentRecord.diary_content}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* 快捷导航 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-2 gap-4"
        >
          <Link to="/history">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-3xl text-white shadow-lg"
            >
              <Calendar size={24} className="mb-3" />
              <h3 className="font-semibold mb-1">历史记录</h3>
              <p className="text-sm opacity-90">查看过往心情</p>
            </motion.div>
          </Link>
          
          <Link to="/analytics">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="bg-gradient-to-br from-green-500 to-blue-500 p-6 rounded-3xl text-white shadow-lg"
            >
              <TrendingUp size={24} className="mb-3" />
              <h3 className="font-semibold mb-1">趋势分析</h3>
              <p className="text-sm opacity-90">了解情绪变化</p>
            </motion.div>
          </Link>
        </motion.div>

        {/* 温馨提示 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-gradient-to-r from-pink-100 to-purple-100 rounded-3xl p-6 text-center"
        >
          <Heart size={24} className="text-pink-500 mx-auto mb-2" />
          <p className="text-gray-700 text-sm leading-relaxed">
            每天记录一点心情，让生活更有温度 💝
          </p>
        </motion.div>
      </div>
    </div>
  )
}