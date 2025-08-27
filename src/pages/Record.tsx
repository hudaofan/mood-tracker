import { useState } from 'react'
import { motion } from 'framer-motion'
import { Camera, Mic, Save, LogIn } from 'lucide-react'
import { supabase, MOOD_TYPES, MoodRecord } from '@/lib/supabase'
import { useAuthContext } from '@/contexts/AuthContext'
import { toast } from 'sonner'

type MoodType = keyof typeof MOOD_TYPES

export default function Record() {
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null)
  const [intensity, setIntensity] = useState(3)
  const [diaryContent, setDiaryContent] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { user, isAuthenticated } = useAuthContext()

  const handleSave = async () => {
    if (!selectedMood) {
      toast.error('请选择一个情绪')
      return
    }
    
    if (!isAuthenticated || !user) {
      toast.error('请先登录后再保存记录')
      return
    }
    
    setIsLoading(true)
    try {
      const { data, error } = await supabase
        .from('mood_records')
        .insert({
          mood_type: selectedMood,
          mood_intensity: intensity,
          diary_content: diaryContent || null,
          user_id: user.id // 使用真实用户ID
        })
      
      if (error) throw error
      
      // 重置表单
      setSelectedMood(null)
      setIntensity(3)
      setDiaryContent('')
      
      toast.success('情绪记录保存成功！')
    } catch (error: any) {
      console.error('保存失败:', error)
      toast.error(error.message || '保存失败，请重试')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen p-4 pt-8">
      <div className="max-w-md mx-auto">
        {/* 标题 */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-8"
        >
          <h1 className="text-2xl font-bold text-gray-800 mb-2">记录心情</h1>
          <p className="text-gray-600">选择你现在的感受</p>
        </motion.div>

        {/* 情绪选择器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-4">选择情绪</h2>
          <div className="grid grid-cols-4 gap-3">
            {Object.entries(MOOD_TYPES).map(([key, mood]) => {
              const isSelected = selectedMood === key
              return (
                <motion.button
                  key={key}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setSelectedMood(key as MoodType)}
                  className={`p-4 rounded-2xl border-2 transition-all duration-300 ${
                    isSelected
                      ? 'border-purple-300 bg-purple-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-purple-200'
                  }`}
                  style={{
                    backgroundColor: isSelected ? mood.color : undefined
                  }}
                >
                  <div className="text-2xl mb-1">{mood.emoji}</div>
                  <div className="text-xs text-gray-600">{mood.label}</div>
                </motion.button>
              )
            })}
          </div>
        </motion.div>

        {/* 强度选择器 */}
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-8"
          >
            <h2 className="text-lg font-semibold text-gray-700 mb-4">情绪强度</h2>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-gray-500">轻微</span>
              <span className="text-sm text-gray-500">强烈</span>
            </div>
            <input
              type="range"
              min="1"
              max="5"
              value={intensity}
              onChange={(e) => setIntensity(Number(e.target.value))}
              className="w-full h-2 bg-gradient-to-r from-purple-200 to-blue-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="text-center mt-2">
              <span className="text-lg font-medium text-purple-600">{intensity}/5</span>
            </div>
          </motion.div>
        )}

        {/* 日记编辑器 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-4">写下你的想法</h2>
          <textarea
            value={diaryContent}
            onChange={(e) => setDiaryContent(e.target.value)}
            placeholder="今天发生了什么？你有什么感受？"
            className="w-full h-32 p-4 border-2 border-gray-200 rounded-2xl resize-none focus:border-purple-300 focus:outline-none transition-colors duration-300"
          />
        </motion.div>

        {/* 多媒体上传 */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <h2 className="text-lg font-semibold text-gray-700 mb-4">添加媒体</h2>
          <div className="flex gap-4">
            <button className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-300 transition-colors duration-300">
              <Camera size={20} className="text-gray-500" />
              <span className="text-gray-600">添加照片</span>
            </button>
            <button className="flex-1 flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-2xl hover:border-purple-300 transition-colors duration-300">
              <Mic size={20} className="text-gray-500" />
              <span className="text-gray-600">录音</span>
            </button>
          </div>
        </motion.div>

        {/* 保存按钮 */}
        <motion.button
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleSave}
          disabled={!selectedMood || isLoading}
          className="w-full flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-purple-400 to-blue-400 text-white rounded-2xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300"
        >
          <Save size={20} />
          {isLoading ? '保存中...' : '保存记录'}
        </motion.button>
      </div>
    </div>
  )
}