import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, List, ChevronLeft, ChevronRight } from 'lucide-react'
import { supabase, MOOD_TYPES, MoodRecord } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'

type ViewMode = 'calendar' | 'list'

export default function History() {
  const [viewMode, setViewMode] = useState<ViewMode>('calendar')
  const [records, setRecords] = useState<MoodRecord[]>([])
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [isLoading, setIsLoading] = useState(true)
  const { user, isAuthenticated } = useAuthContext()

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchRecords()
    } else {
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  const fetchRecords = async () => {
    if (!user) return
    
    try {
      const { data, error } = await supabase
        .from('mood_records')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
      
      if (error) throw error
      setRecords(data || [])
    } catch (error) {
      console.error('获取记录失败:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getRecordsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return records.filter(record => 
      record.created_at.startsWith(dateStr)
    )
  }

  const generateCalendarDays = () => {
    const year = selectedDate.getFullYear()
    const month = selectedDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())
    
    const days = []
    for (let i = 0; i < 42; i++) {
      const date = new Date(startDate)
      date.setDate(startDate.getDate() + i)
      days.push(date)
    }
    return days
  }

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long'
    })
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(selectedDate)
    newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
    setSelectedDate(newDate)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">加载中...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-4 pt-8">
      <div className="max-w-md mx-auto">
        {/* 标题和视图切换 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <h1 className="text-2xl font-bold text-gray-800">历史记录</h1>
          <div className="flex bg-gray-100 rounded-2xl p-1">
            <button
              onClick={() => setViewMode('calendar')}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                viewMode === 'calendar'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              <Calendar size={16} />
              <span className="text-sm">日历</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`flex items-center gap-1 px-3 py-2 rounded-xl transition-all duration-300 ${
                viewMode === 'list'
                  ? 'bg-white text-purple-600 shadow-sm'
                  : 'text-gray-600'
              }`}
            >
              <List size={16} />
              <span className="text-sm">列表</span>
            </button>
          </div>
        </motion.div>

        {/* 日历视图 */}
        {viewMode === 'calendar' && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100"
          >
            {/* 月份导航 */}
            <div className="flex items-center justify-between mb-6">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-300"
              >
                <ChevronLeft size={20} className="text-gray-600" />
              </button>
              <h2 className="text-lg font-semibold text-gray-800">
                {formatDate(selectedDate)}
              </h2>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-xl transition-colors duration-300"
              >
                <ChevronRight size={20} className="text-gray-600" />
              </button>
            </div>

            {/* 星期标题 */}
            <div className="grid grid-cols-7 gap-1 mb-2">
              {['日', '一', '二', '三', '四', '五', '六'].map(day => (
                <div key={day} className="text-center text-sm text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* 日历格子 */}
            <div className="grid grid-cols-7 gap-1">
              {generateCalendarDays().map((date, index) => {
                const dayRecords = getRecordsForDate(date)
                const isCurrentMonth = date.getMonth() === selectedDate.getMonth()
                const isToday = date.toDateString() === new Date().toDateString()
                
                return (
                  <motion.div
                    key={index}
                    whileHover={{ scale: 1.05 }}
                    className={`aspect-square flex flex-col items-center justify-center p-1 rounded-xl cursor-pointer transition-all duration-300 ${
                      isCurrentMonth ? 'text-gray-800' : 'text-gray-300'
                    } ${
                      isToday ? 'bg-purple-100 border-2 border-purple-300' : 'hover:bg-gray-50'
                    }`}
                  >
                    <span className="text-sm font-medium">{date.getDate()}</span>
                    {dayRecords.length > 0 && (
                      <div className="flex gap-0.5 mt-1">
                        {dayRecords.slice(0, 3).map((record, i) => {
                          const mood = MOOD_TYPES[record.mood_type]
                          return (
                            <div
                              key={i}
                              className="w-1.5 h-1.5 rounded-full"
                              style={{ backgroundColor: mood.color }}
                            />
                          )
                        })}
                        {dayRecords.length > 3 && (
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-400" />
                        )}
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* 列表视图 */}
        {viewMode === 'list' && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-4"
          >
            {records.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-gray-400 mb-2">还没有记录</div>
                <div className="text-sm text-gray-500">去记录你的第一个心情吧！</div>
              </div>
            ) : (
              records.map((record, index) => {
                const mood = MOOD_TYPES[record.mood_type]
                const date = new Date(record.created_at)
                
                return (
                  <motion.div
                    key={record.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100"
                  >
                    <div className="flex items-start gap-3">
                      <div 
                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-xl"
                        style={{ backgroundColor: mood.color }}
                      >
                        {mood.emoji}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium text-gray-800">{mood.label}</span>
                          <div className="flex gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <div
                                key={i}
                                className={`w-2 h-2 rounded-full ${
                                  i < record.mood_intensity ? 'bg-purple-400' : 'bg-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                        <div className="text-sm text-gray-500 mb-2">
                          {date.toLocaleDateString('zh-CN')} {date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
                        </div>
                        {record.diary_content && (
                          <p className="text-gray-700 text-sm leading-relaxed">
                            {record.diary_content}
                          </p>
                        )}
                      </div>
                    </div>
                  </motion.div>
                )
              })
            )}
          </motion.div>
        )}
      </div>
    </div>
  )
}