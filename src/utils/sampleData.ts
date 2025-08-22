import { supabase } from '@/lib/supabase'

// 示例情绪记录数据
const sampleMoodRecords = [
  {
    mood_type: 'happy',
    mood_intensity: 4,
    diary_content: '今天和朋友一起去了咖啡店，聊了很多有趣的话题，心情特别好！阳光透过窗户洒在桌子上，温暖而美好。',
    created_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() // 1天前
  },
  {
    mood_type: 'excited',
    mood_intensity: 5,
    diary_content: '收到了心仪已久的工作offer！激动得睡不着觉，感觉所有的努力都值得了。新的开始，新的挑战！',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() // 2天前
  },
  {
    mood_type: 'calm',
    mood_intensity: 3,
    diary_content: '在公园里散步，看着夕阳西下，内心很平静。有时候慢下来感受生活的美好也很重要。',
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() // 3天前
  },
  {
    mood_type: 'anxious',
    mood_intensity: 4,
    diary_content: '明天要面试了，有点紧张。虽然准备了很久，但还是担心会出现意外情况。深呼吸，相信自己！',
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString() // 4天前
  },
  {
    mood_type: 'happy',
    mood_intensity: 4,
    diary_content: '妈妈做了我最爱吃的菜，突然觉得很感动。家人的关爱总是那么温暖，让人感到幸福和感激。',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString() // 5天前
  },
  {
    mood_type: 'sad',
    mood_intensity: 2,
    diary_content: '看了一部很感人的电影，眼泪止不住地流。有时候哭一哭也是一种释放，让心情得到缓解。',
    created_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString() // 6天前
  },
  {
    mood_type: 'excited',
    mood_intensity: 5,
    diary_content: '早上去跑步了！运动后整个人都充满了活力，感觉可以征服世界。健康的身体真的很重要。',
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString() // 7天前
  },
  {
    mood_type: 'calm',
    mood_intensity: 4,
    diary_content: '在家里读书，泡了一壶好茶。安静的午后时光，没有任何打扰，只有书香和茶香相伴。',
    created_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString() // 8天前
  },
  {
    mood_type: 'angry',
    mood_intensity: 3,
    diary_content: '项目遇到了一些技术难题，调试了一整天都没有解决。有点沮丧，但明天继续努力！',
    created_at: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString() // 9天前
  },
  {
    mood_type: 'happy',
    mood_intensity: 4,
    diary_content: '和家人一起吃晚饭，聊着日常的琐事。简单的幸福就是这样，平凡却珍贵。',
    created_at: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString() // 10天前
  },
  {
    mood_type: 'happy',
    mood_intensity: 5,
    diary_content: '朋友给我带来了惊喜生日礼物！虽然生日已经过了，但这份心意让我特别感动和开心。',
    created_at: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString() // 12天前
  },
  {
    mood_type: 'confused',
    mood_intensity: 3,
    diary_content: '今天是周末，一个人在家思考了很多事情。关于未来，关于梦想，关于人生的方向。',
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString() // 14天前
  },
  {
    mood_type: 'excited',
    mood_intensity: 4,
    diary_content: '计划了一次周末旅行！好久没有出去走走了，期待能看到不同的风景，体验新的感受。',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString() // 15天前
  },
  {
    mood_type: 'calm',
    mood_intensity: 4,
    diary_content: '练习了冥想，感觉内心变得更加平静。在这个快节奏的世界里，学会让自己慢下来很重要。',
    created_at: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString() // 18天前
  },
  {
    mood_type: 'happy',
    mood_intensity: 5,
    diary_content: '今天收到了很多朋友的关心和祝福，感觉自己是世界上最幸运的人。感恩遇到这么多美好的人。',
    created_at: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString() // 20天前
  }
]

// 插入示例数据的函数
export const insertSampleData = async () => {
  try {
    // 检查是否已经有数据
    const { data: existingData, error: checkError } = await supabase
      .from('mood_records')
      .select('id')
      .limit(1)
    
    if (checkError) {
      console.error('检查现有数据失败:', checkError)
      return false
    }
    
    // 如果已经有数据，就不插入示例数据
    if (existingData && existingData.length > 0) {
      console.log('数据库中已有数据，跳过插入示例数据')
      return true
    }
    
    // 插入示例数据
    const { error } = await supabase
      .from('mood_records')
      .insert(sampleMoodRecords)
    
    if (error) {
      console.error('插入示例数据失败:', error)
      return false
    }
    
    console.log('示例数据插入成功！')
    return true
  } catch (error) {
    console.error('插入示例数据时发生错误:', error)
    return false
  }
}

// 清除所有数据的函数（开发时使用）
export const clearAllData = async () => {
  try {
    const { error } = await supabase
      .from('mood_records')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // 删除所有记录
    
    if (error) {
      console.error('清除数据失败:', error)
      return false
    }
    
    console.log('所有数据已清除')
    return true
  } catch (error) {
    console.error('清除数据时发生错误:', error)
    return false
  }
}