import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://iagsvnjeciyxqgtvhwth.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlhZ3N2bmplY2l5eHFndHZod3RoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU4NTA5NDksImV4cCI6MjA3MTQyNjk0OX0.ZJL2gBTHG5UEFiWTcIIqPylvgg9dX4tkUDfr3B9X-eU'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 数据库类型定义
export interface User {
  id: string
  email: string
  username?: string
  avatar_url?: string
  created_at: string
  updated_at: string
}

export interface MoodRecord {
  id: string
  user_id: string
  mood_type: 'happy' | 'sad' | 'angry' | 'anxious' | 'calm' | 'excited' | 'tired' | 'confused'
  mood_intensity: number // 1-5
  diary_content?: string
  photo_url?: string
  audio_url?: string
  tags?: string[]
  created_at: string
  updated_at: string
}

// 情绪类型配置
export const MOOD_TYPES = {
  happy: { label: '开心', emoji: '😊', color: '#FFE4E1' },
  sad: { label: '难过', emoji: '😢', color: '#E6E6FA' },
  angry: { label: '愤怒', emoji: '😠', color: '#FFB6C1' },
  anxious: { label: '焦虑', emoji: '😰', color: '#F0E68C' },
  calm: { label: '平静', emoji: '😌', color: '#E0F6FF' },
  excited: { label: '兴奋', emoji: '🤩', color: '#FFE4B5' },
  tired: { label: '疲惫', emoji: '😴', color: '#D3D3D3' },
  confused: { label: '困惑', emoji: '😕', color: '#DDA0DD' }
} as const